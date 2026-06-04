import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getSentryDsn } from "@/lib/sentry-config";

/** Sentry doğrulama — POST /api/sentry-test */
export async function POST() {
  if (!getSentryDsn()) {
    return NextResponse.json({ error: "sentry_not_configured" }, { status: 503 });
  }

  const err = new Error("Sentry server test error — zippr.ink");
  Sentry.captureException(err);
  await Sentry.flush(2000);

  return NextResponse.json({ ok: true, message: "Server error sent to Sentry" });
}
