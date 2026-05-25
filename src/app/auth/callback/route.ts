import type { NextRequest } from "next/server";
import { handleAuthCallback } from "@/lib/auth-callback";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";

function resolveLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && routing.locales.includes(cookie as "de" | "en" | "tr")) {
    return cookie;
  }
  return routing.defaultLocale;
}

/** Google dönüşü — PKCE çerezleri istekle gelir, sunucuda oturum açılır */
export async function GET(request: NextRequest) {
  return handleAuthCallback(request, resolveLocale(request));
}
