import * as Sentry from "@sentry/nextjs";
import { getSentryDsn, getSentryTracesSampleRate } from "@/lib/sentry-config";

const dsn = getSentryDsn();
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: getSentryTracesSampleRate(),
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
