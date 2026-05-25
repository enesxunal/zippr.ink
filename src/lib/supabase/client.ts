import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "@/lib/supabase/public-env";

/** PKCE code verifier cookie'de saklanır — sunucu API callback ile uyumlu */
export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase not configured");
  }

  return createBrowserClient(url, anonKey, {
    cookies: {
      getAll() {
        return document.cookie.split(";").map((part) => {
          const [name, ...rest] = part.trim().split("=");
          return { name, value: decodeURIComponent(rest.join("=") || "") };
        });
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const secure = window.location.protocol === "https:" ? "; Secure" : "";
          const maxAge = options?.maxAge ? `; Max-Age=${options.maxAge}` : "";
          const path = `; Path=${options?.path ?? "/"}`;
          const sameSite = `; SameSite=${options?.sameSite ?? "Lax"}`;
          document.cookie = `${name}=${encodeURIComponent(value)}${path}${maxAge}${sameSite}${secure}`;
        });
      },
    },
  });
}
