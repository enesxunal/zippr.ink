import sharp from "sharp";
import type { ImageFormat } from "@/types/database";

export type ApiOutputFormat = "original" | "webp" | "avif" | "jpeg" | "png";

export interface OptimizeImageOptions {
  quality?: number;
  format?: ApiOutputFormat;
  maxWidth?: number | null;
  maxHeight?: number | null;
  stripMetadata?: boolean;
}

export interface OptimizeImageResult {
  buffer: Buffer;
  mimeType: string;
  format: string;
  width: number;
  height: number;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  compressionRatio: number;
}

function clampQuality(q: number): number {
  return Math.min(100, Math.max(1, Math.round(q)));
}

function compressionRatio(original: number, optimized: number): number {
  if (original <= 0) return 0;
  return Math.round((1 - optimized / original) * 10000) / 100;
}

function detectFormatFromMime(mime: string): ImageFormat {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("avif")) return "avif";
  return "jpeg";
}

/** Shared image optimization — used by UI transform route and public API */
export async function optimizeImage(
  inputBuffer: Buffer,
  inputMime: string,
  options: OptimizeImageOptions = {}
): Promise<OptimizeImageResult> {
  const quality = clampQuality(options.quality ?? 82);
  const stripMetadata = options.stripMetadata ?? true;
  const outputFormat = options.format ?? "original";

  let pipeline = sharp(inputBuffer, {
    limitInputPixels: 268402689,
    failOn: "none",
  });

  if (stripMetadata) {
    pipeline = pipeline.rotate();
  }

  const resizeWidth = options.maxWidth ?? undefined;
  const resizeHeight = options.maxHeight ?? undefined;
  if (resizeWidth || resizeHeight) {
    pipeline = pipeline.resize({
      width: resizeWidth ?? undefined,
      height: resizeHeight ?? undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const metadata = await sharp(inputBuffer).metadata();
  const resolvedOutput: ImageFormat =
    outputFormat === "original"
      ? detectFormatFromMime(inputMime)
      : outputFormat === "jpeg"
        ? "jpeg"
        : (outputFormat as ImageFormat);

  let outputBuffer: Buffer;
  let mimeType: string;

  switch (resolvedOutput) {
    case "webp":
      outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
      mimeType = "image/webp";
      break;
    case "png":
      outputBuffer = await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer();
      mimeType = "image/png";
      break;
    case "jpeg":
      outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      mimeType = "image/jpeg";
      break;
    case "avif":
      outputBuffer = await pipeline.avif({ quality, effort: 4 }).toBuffer();
      mimeType = "image/avif";
      break;
    default:
      outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
      mimeType = "image/jpeg";
  }

  const outMeta = await sharp(outputBuffer).metadata();
  const originalSize = inputBuffer.length;
  const optimizedSize = outputBuffer.length;

  return {
    buffer: outputBuffer,
    mimeType,
    format: resolvedOutput === "jpeg" ? "jpeg" : resolvedOutput,
    width: outMeta.width ?? metadata.width ?? 0,
    height: outMeta.height ?? metadata.height ?? 0,
    originalSizeBytes: originalSize,
    optimizedSizeBytes: optimizedSize,
    compressionRatio: compressionRatio(originalSize, optimizedSize),
  };
}
