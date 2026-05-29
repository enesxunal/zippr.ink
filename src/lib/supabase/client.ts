import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/public-env";
import { browserCookieMethods } from "@/lib/supabase/browser-cookies";

export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase not configured");
  }

  return createBrowserClient(url, anonKey, {
    cookies: browserCookieMethods,
    auth: {
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
}
