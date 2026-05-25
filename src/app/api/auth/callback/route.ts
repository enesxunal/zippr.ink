import { NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";

/** Eski /api/auth/callback linkleri → tarayıcıda PKCE ile /auth/callback */
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const url = new URL(request.url);
  const dest = new URL("/auth/callback", origin);
  dest.search = url.search;
  return NextResponse.redirect(dest);
}
