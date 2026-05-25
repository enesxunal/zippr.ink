import type { SupabaseClient } from "@supabase/supabase-js";
import { generateSecureSlug, isValidSlug, slugify } from "@/lib/utils";

/** Default slug for new uploads — not guessable from file name */
export function createDefaultUploadSlug(): string {
  return generateSecureSlug(12);
}

/** Finds a free slug: base, base-2, base-3 … or base-xxxx */
export async function resolveUniqueSlug(
  admin: SupabaseClient,
  requested: string
): Promise<{ slug: string; adjusted: boolean }> {
  const base = slugify(requested);
  if (!isValidSlug(base)) {
    throw new Error("invalid_slug");
  }

  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!isValidSlug(candidate)) continue;

    const { data } = await admin
      .from("files")
      .select("id")
      .eq("slug", candidate)
      .eq("status", "active")
      .maybeSingle();

    if (!data) {
      return { slug: candidate, adjusted: i > 0 };
    }
  }

  const fallback = `${base}-${Date.now().toString(36).slice(-4)}`;
  return { slug: fallback, adjusted: true };
}

export function mapUploadError(
  code: string,
  t: (key: string) => string
): string {
  const keys: Record<string, string> = {
    slug_taken: "slugTaken",
    invalid_slug: "invalidSlug",
    storage_limit_exceeded: "storageLimit",
    file_too_large_for_plan: "fileTooLarge",
    account_banned: "uploadFailed",
    db_error: "uploadFailed",
    init_failed: "uploadFailed",
    missing_fields: "uploadFailed",
    r2_upload_failed: "uploadCors",
    r2_not_configured: "uploadFailed",
    complete_failed: "uploadFailed",
    "Missing fields": "uploadFailed",
    "File not found": "uploadFailed",
  };
  const key = keys[code];
  return key ? t(key) : t("uploadFailed");
}
