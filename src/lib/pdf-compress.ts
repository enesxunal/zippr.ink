import {
  PDFDocument,
  PDFName,
  PDFRawStream,
  PDFDict,
  PDFNumber,
  decodePDFRawStream,
  PDFArray,
} from "pdf-lib";
import sharp from "sharp";

const JPEG_QUALITY = 68;
const MAX_IMAGE_EDGE = 1600;

function filterName(filter: unknown): string | null {
  if (!filter) return null;
  if (filter instanceof PDFName) return filter.decodeText();
  if (filter instanceof PDFArray && filter.size() > 0) {
    const first = filter.get(0);
    if (first instanceof PDFName) return first.decodeText();
  }
  return null;
}

function isJpegFilter(name: string | null): boolean {
  return name === "DCTDecode" || name === "DCT";
}

function isFlateFilter(name: string | null): boolean {
  return name === "FlateDecode" || name === "Fl";
}

function readNumber(obj: unknown): number {
  if (obj instanceof PDFNumber) return obj.asNumber();
  return 0;
}

async function recompressImageBytes(
  bytes: Uint8Array,
  width: number,
  height: number,
  colorSpace: string | null
): Promise<{ data: Uint8Array; filter: "DCTDecode" } | null> {
  try {
    let pipeline = sharp(Buffer.from(bytes), {
      failOn: "none",
      limitInputPixels: 268402689,
    });

    const meta = await pipeline.metadata();
    const w = meta.width || width;
    const h = meta.height || height;

    if (w > MAX_IMAGE_EDGE || h > MAX_IMAGE_EDGE) {
      pipeline = pipeline.resize({
        width: MAX_IMAGE_EDGE,
        height: MAX_IMAGE_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (colorSpace === "DeviceCMYK" || colorSpace === "ICCBased") {
      pipeline = pipeline.toColorspace("srgb");
    }

    const out = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toBuffer();

    if (out.length >= bytes.length * 0.95) return null;
    return { data: new Uint8Array(out), filter: "DCTDecode" };
  } catch {
    return null;
  }
}

/**
 * PDF içindeki gömülü görselleri yeniden kodlar ve object stream ile kaydeder.
 * Metin/vektör içeriği korunur; tarama/görsel ağırlıklı PDF'lerde boyut düşer.
 */
export async function compressPdfBuffer(
  input: Uint8Array
): Promise<{ buffer: Uint8Array; imagesTouched: number }> {
  const pdfDoc = await PDFDocument.load(input, { ignoreEncryption: true });
  const context = pdfDoc.context;
  let imagesTouched = 0;

  for (const [, obj] of context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (!(dict instanceof PDFDict)) continue;

    const subtype = dict.lookup(PDFName.of("Subtype"));
    if (!(subtype instanceof PDFName) || subtype.decodeText() !== "Image") {
      continue;
    }

    const filter = filterName(dict.lookup(PDFName.of("Filter")));
    if (!isJpegFilter(filter) && !isFlateFilter(filter)) continue;

    const width = readNumber(dict.lookup(PDFName.of("Width")));
    const height = readNumber(dict.lookup(PDFName.of("Height")));

    const cs = dict.lookup(PDFName.of("ColorSpace"));
    let colorSpace: string | null = null;
    if (cs instanceof PDFName) colorSpace = cs.decodeText();

    let raw: Uint8Array;
    try {
      if (isJpegFilter(filter)) {
        raw = obj.contents;
      } else {
        const decoded = decodePDFRawStream(obj);
        raw = decoded.decode();
      }
    } catch {
      continue;
    }

    if (!raw.length || raw.length < 512) continue;

    const recompressed = await recompressImageBytes(raw, width, height, colorSpace);
    if (!recompressed) continue;

    try {
      dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
      dict.delete(PDFName.of("DecodeParms"));
      dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
      dict.set(PDFName.of("BitsPerComponent"), context.obj(8));

      const meta = await sharp(Buffer.from(recompressed.data), { failOn: "none" }).metadata();
      if (meta.width) dict.set(PDFName.of("Width"), context.obj(meta.width));
      if (meta.height) dict.set(PDFName.of("Height"), context.obj(meta.height));

      (obj as { contents: Uint8Array }).contents = recompressed.data;
      dict.set(PDFName.of("Length"), context.obj(recompressed.data.length));
      imagesTouched += 1;
    } catch {
      continue;
    }
  }

  try {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer("zippr.ink");
    pdfDoc.setCreator("zippr.ink");
  } catch {
    /* metadata optional */
  }

  const saved = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });

  if (saved.length >= input.length) {
    try {
      const fallback = await PDFDocument.load(input, { ignoreEncryption: true });
      const lean = await fallback.save({ useObjectStreams: true, addDefaultPage: false });
      if (lean.length < input.length) {
        return { buffer: lean, imagesTouched: 0 };
      }
    } catch {
      /* keep original */
    }
    return { buffer: input, imagesTouched: 0 };
  }

  return { buffer: saved, imagesTouched };
}
