import { routing } from "@/i18n/routing";
import { getClientAppOrigin } from "@/lib/app-url";

/** OAuth callback URL matching next-intl locale prefix rules */
export function getAuthCallbackUrl(_origin: string, locale: string): string {
  const base = getClientAppOrigin();
  if (locale === routing.defaultLocale) {
    return `${base}/auth/callback`;
  }
  return `${base}/${locale}/auth/callback`;
}
