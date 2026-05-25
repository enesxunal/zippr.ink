import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";

/** /tr/auth/callback → /auth/callback (PKCE tarayıcıda) */
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const url = new URL(request.url);
  const dest = new URL("/auth/callback", origin);
  dest.search = url.search;
  return NextResponse.redirect(dest);
}
