import { createServiceClient } from "@/lib/supabase/admin";
import type { FileRecord } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Kullanıcının dosyalarını listeler — service role ile güvenilir (RLS/atama sorunlarında). */
export async function listUserFiles(
  userId: string,
  fallback?: SupabaseClient
): Promise<FileRecord[]> {
  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });

    if (!error && data) return data as FileRecord[];
  } catch (e) {
    console.error("listUserFiles admin:", e);
  }

  if (fallback) {
    const { data } = await fallback
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "deleted")
      .order("created_at", { ascending: false });
    return (data as FileRecord[]) ?? [];
  }

  return [];
}
