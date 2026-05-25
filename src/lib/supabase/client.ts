import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/public-env";

/** Tarayıcıda Supabase'in kendi cookie (base64url) yönetimini kullanır — PKCE için gerekli */
export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase not configured");
  }

  return createBrowserClient(url, anonKey);
}
