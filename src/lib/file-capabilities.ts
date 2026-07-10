import { isImageFile, isPdfFile, getExtension } from "@/lib/file-types";

export type FileCategory = "image" | "pdf" | "archive" | "office" | "other";

export function getFileCategory(mime: string, name?: string): FileCategory {
  if (isImageFile(mime, name)) return "image";
  if (isPdfFile(mime, name)) return "pdf";

  const m = (mime || "").toLowerCase();
  const ext = getExtension(name);

  if (
    m.includes("zip") ||
    m.includes("rar") ||
    ext === ".zip" ||
    ext === ".rar" ||
    ext === ".7z"
  ) {
    return "archive";
  }

  if (
    m.includes("word") ||
    m.includes("excel") ||
    m.includes("powerpoint") ||
    m.includes("presentation") ||
    m.includes("spreadsheet") ||
    /\.(docx?|xlsx?|pptx?)$/i.test(name || "")
  ) {
    return "office";
  }

  return "other";
}

export type ImageOutputFormat = "webp" | "png" | "jpeg" | "gif" | "avif";

/** Sıkıştırma: dosya hangi formattaysa aynı formatta kalır (format değiştirme = Dönüştür aracı). */
export function getCompressOutputFormat(mime: string, name?: string): ImageOutputFormat {
  const m = (mime || "").toLowerCase().split(";")[0].trim();
  const ext = name?.split(".").pop()?.toLowerCase() ?? "";

  if (m === "image/png" || ext === "png") return "png";
  if (m === "image/webp" || ext === "webp") return "webp";
  if (m === "image/gif" || ext === "gif") return "gif";
  if (m === "image/avif" || ext === "avif") return "avif";
  if (
    m === "image/jpeg" ||
    m === "image/jpg" ||
    m === "image/pjpeg" ||
    m === "image/jfif" ||
    ext === "jpg" ||
    ext === "jpeg" ||
    ext === "jpe" ||
    ext === "jfif"
  ) {
    return "jpeg";
  }

  // HEIC/TIFF/BMP: yeniden kodlama gerekir; mümkün olan en yakın yaygın format
  if (m === "image/heic" || m === "image/heif" || ext === "heic" || ext === "heif") {
    return "jpeg";
  }
  if (m === "image/tiff" || m === "image/tif" || ext === "tiff" || ext === "tif") {
    return "png";
  }
  if (m === "image/bmp" || m === "image/x-ms-bmp" || ext === "bmp") return "png";

  return "jpeg";
}

export function getConvertTargets(category: FileCategory): ImageOutputFormat[] {
  if (category === "image") return ["webp", "png", "jpeg"];
  return [];
}

export function canCompress(category: FileCategory): boolean {
  return category === "image" || category === "pdf";
}

export function canConvert(category: FileCategory): boolean {
  return category === "image";
}

export function formatLabel(mime: string, name: string): string {
  const cat = getFileCategory(mime, name);
  const map: Record<FileCategory, string> = {
    image: "Image",
    pdf: "PDF",
    archive: "Archive",
    office: "Office",
    other: "File",
  };
  return map[cat];
}
