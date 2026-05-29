"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig, isSupabaseConfigured } from "@/lib/supabase/public-env";
import { browserCookieMethods } from "@/lib/supabase/browser-cookies";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }
  const { url, anonKey } = getSupabaseBrowserConfig();

  return createBrowserClient(url, anonKey, {
    cookies: browserCookieMethods,
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
    },
  });
}

export function tryCreateClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}
