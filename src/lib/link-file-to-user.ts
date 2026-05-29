import type { SupabaseClient } from "@supabase/supabase-js";
import { getExpiryDate } from "@/lib/plans";
import type { PlanType } from "@/types/database";

type LinkableFile = {
  id: string;
  slug?: string;
  file_size: number | string;
};

/** Sahipsiz dosyaları kullanıcıya bağlar; depolama ve süreyi plana göre günceller. */
export async function linkFilesToUser(
  admin: SupabaseClient,
  userId: string,
  files: LinkableFile[]
): Promise<string[]> {
  if (!files.length) return [];

  const { data: profile } = await admin
    .from("profiles")
    .select("plan_type, storage_used")
    .eq("id", userId)
    .single();

  const planType = (profile?.plan_type as PlanType) || "free";
  const expiresAt = getExpiryDate(planType, false)?.toISOString() ?? null;
  const ids = files.map((f) => f.id);

  const { data: updated, error } = await admin
    .from("files")
    .update({ user_id: userId, expires_at: expiresAt })
    .in("id", ids)
    .is("user_id", null)
    .select("slug, file_size");

  if (error || !updated?.length) return [];

  const storageDelta = updated.reduce((sum, f) => sum + Number(f.file_size), 0);

  if (profile && storageDelta > 0) {
    await admin
      .from("profiles")
      .update({ storage_used: Number(profile.storage_used) + storageDelta })
      .eq("id", userId);
  }

  return updated.map((f) => f.slug as string);
}
