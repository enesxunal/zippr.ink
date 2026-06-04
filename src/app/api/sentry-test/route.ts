import { NextResponse } from "next/server";

/** Sentry doğrulama — sadece test için: GET /api/sentry-test */
export async function GET() {
  if (process.env.NODE_ENV === "production" && !process.env.SENTRY_TEST_ENABLED) {
    return NextResponse.json({ error: "disabled" }, { status: 404 });
  }
  throw new Error("Sentry test error — zippr.ink");
}
