import { isImageMime } from "@/lib/file-types";

export type FileCategory = "image" | "pdf" | "archive" | "office" | "other";

export function getFileCategory(mime: string, name?: string): FileCategory {
  if (isImageMime(mime)) return "image";
  if (mime === "application/pdf") return "pdf";
  if (
    mime.includes("zip") ||
    mime.includes("rar") ||
    name?.match(/\.(zip|rar|7z)$/i)
  ) {
    return "archive";
  }
  if (
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("powerpoint") ||
    mime.includes("presentation") ||
    mime.includes("spreadsheet") ||
    name?.match(/\.(docx?|xlsx?|pptx?)$/i)
  ) {
    return "office";
  }
  return "other";
}

export type ImageOutputFormat = "webp" | "png" | "jpeg";

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
