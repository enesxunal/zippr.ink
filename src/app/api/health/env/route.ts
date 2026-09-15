import { NextResponse } from "next/server";

/** Minimal public readiness check. Never expose deployment configuration details. */
export async function GET() {
  const ready = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return NextResponse.json(
    { ok: ready },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
