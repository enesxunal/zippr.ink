/** Upload file bytes to R2: presigned PUT first, then server proxy if that fails (CORS). */
export async function uploadFileBytes(
  file: File,
  fileId: string,
  presignedUrl: string | null
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
      // Browser blocked (CORS) or network error — use server proxy
    }
  }

  const form = new FormData();
  form.append("fileId", fileId);
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
