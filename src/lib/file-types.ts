export const IMAGE_MIMES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/avif",
  "image/heic",
  "image/heif",
];

export const DOCUMENT_MIMES = [
  "application/pdf",
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

export function isImageMime(mime: string): boolean {
  return IMAGE_MIMES.includes(mime) || mime.startsWith("image/");
}

export function isDocumentMime(mime: string): boolean {
  return DOCUMENT_MIMES.includes(mime);
}

export const IMAGE_ACCEPT = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tiff", ".avif", ".heic"],
};

export const DOCUMENT_ACCEPT = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "text/plain": [".txt"],
  "application/zip": [".zip"],
  "application/x-zip-compressed": [".zip"],
};

export const COMPRESS_ACCEPT = {
  ...IMAGE_ACCEPT,
  "application/pdf": [".pdf"],
};

export const SHARE_ACCEPT = {
  ...IMAGE_ACCEPT,
  ...DOCUMENT_ACCEPT,
  "video/*": [".mp4", ".mov", ".webm", ".mkv"],
  "audio/*": [".mp3", ".wav", ".m4a"],
};
