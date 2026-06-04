/** DSN yoksa Sentry kapalı kalır (local geliştirme bozulmaz). */
export function getSentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  const trimmed = dsn?.trim();
  return trimmed || undefined;
}

export function getSentryTracesSampleRate(): number {
  return process.env.NODE_ENV === "production" ? 0.1 : 1.0;
}
