import { createClient } from "@/lib/supabase/client";
import { mapUploadError } from "@/lib/slug";
import { createDefaultUploadSlug } from "@/lib/slug";
import { uploadFileBytes } from "@/lib/upload-storage";
import { getUploadAuthHeaders } from "@/lib/upload-auth";
import { rememberUploadSlug } from "@/lib/pending-upload-slugs";
import { getPublicFileUrl } from "@/lib/app-url";

export type UploadShareResult = {
  shareUrl: string;
  slug: string;
  slugAdjusted: boolean;
};

export async function uploadFileForShare(
  file: File,
  options: {
    customName?: string;
    onProgress?: (percent: number) => void;
    tErr: (key: string) => string;
    ensureSession?: boolean;
  }
): Promise<UploadShareResult> {
  const { customName, onProgress, tErr } = options;
  const slugToUse = createDefaultUploadSlug();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  onProgress?.(10);
  const authHeaders = await getUploadAuthHeaders();

  const initRes = await fetch("/api/upload/init", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    credentials: "include",
    body: JSON.stringify({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      customSlug: slugToUse,
      customName: customName || file.name,
      useCustomSlug: false,
    }),
  });

  const initData = await initRes.json();
  if (!initRes.ok) {
    throw new Error(mapUploadError(initData.error || "", tErr));
  }

  onProgress?.(40);
  await uploadFileBytes(file, initData.fileId, initData.presignedUrl ?? null);
  onProgress?.(80);

  const completeRes = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders },
    credentials: "include",
    body: JSON.stringify({ fileId: initData.fileId }),
  });

  const completeData = await completeRes.json();
  if (!completeRes.ok) {
    throw new Error(mapUploadError(completeData.error || "complete_failed", tErr));
  }

  const slug = initData.slug || slugToUse;
  onProgress?.(100);
  rememberUploadSlug(completeData.slug || initData.slug || slug);

  if (user) {
    try {
      await fetch("/api/files/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({ slugs: [slug] }),
      });
    } catch {
      // non-blocking
    }
  }

  return {
    shareUrl:
      completeData.shareUrl?.includes("localhost")
        ? getPublicFileUrl(slug)
        : completeData.shareUrl || getPublicFileUrl(slug),
    slug,
    slugAdjusted: Boolean(initData.slugAdjusted),
  };
}
