export const IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "image/tif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/jfif",
];

export const IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".jpe",
  ".jfif",
  ".webp",
  ".gif",
  ".bmp",
  ".tif",
  ".tiff",
  ".avif",
  ".heic",
  ".heif",
];

export const DOCUMENT_MIMES = [
  "application/pdf",
  "application/x-pdf",
  "application/acrobat",
  "applications/vnd.pdf",
  "text/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
];

export const GENERAL_MIMES = [
  ...DOCUMENT_MIMES,
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "application/octet-stream",
];

export function getExtension(name?: string): string {
  if (!name) return "";
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i).toLowerCase();
}

export function isImageMime(mime: string): boolean {
  const m = (mime || "").toLowerCase().split(";")[0].trim();
  if (!m) return false;
  return IMAGE_MIMES.includes(m) || m.startsWith("image/");
}

export function isImageFile(mime: string, name?: string): boolean {
  if (isImageMime(mime)) return true;
  const ext = getExtension(name);
  return IMAGE_EXTENSIONS.includes(ext);
}

export function isPdfMime(mime: string): boolean {
  const m = (mime || "").toLowerCase().split(";")[0].trim();
  return (
    m === "application/pdf" ||
    m === "application/x-pdf" ||
    m === "application/acrobat" ||
    m === "applications/vnd.pdf" ||
    m === "text/pdf"
  );
}

export function isPdfFile(mime: string, name?: string): boolean {
  if (isPdfMime(mime)) return true;
  return getExtension(name) === ".pdf";
}

export function isDocumentMime(mime: string): boolean {
  return DOCUMENT_MIMES.includes((mime || "").toLowerCase().split(";")[0].trim());
}

export const IMAGE_ACCEPT = {
  "image/*": IMAGE_EXTENSIONS,
  "image/heic": [".heic", ".heif"],
  "image/heif": [".heic", ".heif"],
  "image/tiff": [".tif", ".tiff"],
  "image/bmp": [".bmp"],
  "image/x-ms-bmp": [".bmp"],
};

export const DOCUMENT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/x-pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
  "application/vnd.rar": [".rar"],
  "application/x-rar-compressed": [".rar"],
};

export const COMPRESS_ACCEPT = {
  ...IMAGE_ACCEPT,
  "application/pdf": [".pdf"],
  "application/x-pdf": [".pdf"],
  "application/acrobat": [".pdf"],
};

export const SHARE_ACCEPT = {
  ...IMAGE_ACCEPT,
  ...DOCUMENT_ACCEPT,
  "video/*": [".mp4", ".mov", ".webm", ".mkv"],
  "audio/*": [".mp3", ".wav", ".m4a"],
};
