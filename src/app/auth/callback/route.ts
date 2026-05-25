import type { NextRequest } from "next/server";
import { handleAuthCallback } from "@/lib/auth-callback";
import { routing } from "@/i18n/routing";

export async function GET(request: NextRequest) {
  return handleAuthCallback(request, routing.defaultLocale);
}
