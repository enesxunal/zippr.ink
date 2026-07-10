import { getPresignedDownloadUrl, getPublicR2Url, isR2Configured } from "@/lib/r2";
import { isImageFile, isPdfFile } from "@/lib/file-types";

export type PreviewKind = "image" | "pdf" | "none";

export function getPreviewKind(mimeType: string, fileName?: string): PreviewKind {
  if (isImageFile(mimeType, fileName)) return "image";
  if (isPdfFile(mimeType, fileName)) return "pdf";
  return "none";
}

/** Short-lived URL for dashboard/share preview (no file bytes through our server). */
export async function getFilePreviewUrl(
  r2Key: string | null,
  mimeType: string
): Promise<{ url: string | null; kind: PreviewKind }> {
  const kind = getPreviewKind(mimeType);
  if (kind === "none" || !r2Key || !isR2Configured()) {
    return { url: null, kind };
  }

  const publicUrl = getPublicR2Url(r2Key);
  if (publicUrl) return { url: publicUrl, kind };

  try {
    const url = await getPresignedDownloadUrl(r2Key, 900);
    return { url, kind };
  } catch {
    return { url: null, kind };
  }
}
