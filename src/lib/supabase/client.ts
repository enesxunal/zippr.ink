import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/public-env";

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase not configured");
  }
  return createBrowserClient(url, anonKey);
}
