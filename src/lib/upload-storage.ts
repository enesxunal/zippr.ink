/** Upload file bytes to R2: presigned PUT first; proxy fallback is intentionally capped. */
const MAX_PROXY_FALLBACK_BYTES = 50 * 1024 * 1024;

export async function uploadFileBytes(
  file: File,
  fileId: string,
  presignedUrl: string | null,
  uploadToken: string
): Promise<void> {
  const contentType = file.type || "application/octet-stream";

  if (presignedUrl) {
    try {
      const res = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": contentType },
      });
      if (res.ok) return;
    } catch {
      // Browser blocked (CORS) or network error. Small files may use the server fallback below.
    }
  }

  // Large files must upload directly to R2. Proxying them through the app server can
  // consume large amounts of RAM and trigger timeouts/502s on a small VPS.
  if (file.size > MAX_PROXY_FALLBACK_BYTES) {
    throw new Error("r2_direct_upload_required");
  }

  const form = new FormData();
  form.append("fileId", fileId);
  form.append("uploadToken", uploadToken);
  form.append("file", file);

  const res = await fetch("/api/upload/direct", {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "r2_upload_failed");
  }
}
