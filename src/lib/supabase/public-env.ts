/** Sunucudaki .env.local → layout meta → tarayıcı (build'deki eski xxxx değerini ezer). */
export function readPublicEnv(name: string): string {
  if (typeof document !== "undefined") {
    const fromMeta = document.querySelector(`meta[name="${name}"]`)?.getAttribute("content");
    if (fromMeta) return fromMeta;
  }
  const map: Record<string, string | undefined> = {
    "zippr-supabase-url": process.env.NEXT_PUBLIC_SUPABASE_URL,
    "zippr-supabase-anon": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "zippr-app-url": process.env.NEXT_PUBLIC_APP_URL,
  };
  return map[name] ?? "";
}

export function getSupabaseBrowserConfig(): { url: string; anonKey: string } {
  const url = readPublicEnv("zippr-supabase-url").trim();
  const anonKey = readPublicEnv("zippr-supabase-anon").trim();
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return Boolean(url && anonKey && url.includes(".supabase.co") && !url.includes("xxxx"));
}
