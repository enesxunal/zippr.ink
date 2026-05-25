import { NextResponse } from "next/server";

/** Teşhis: /api/health/env — anahtarları göstermez */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  let host = "missing";
  if (url.includes("xxxx")) host = "PLACEHOLDER_XXXX";
  else if (url.includes(".supabase.co")) {
    try {
      host = new URL(url).hostname;
    } catch {
      host = "invalid-url";
    }
  }

  return NextResponse.json({
    ok: host.includes("supabase.co") && !host.includes("xxxx"),
    supabaseHost: host,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "missing",
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  });
}
