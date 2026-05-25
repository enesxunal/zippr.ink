import { routing } from "@/i18n/routing";

/** OAuth callback URL matching next-intl locale prefix rules */
export function getAuthCallbackUrl(origin: string, locale: string): string {
  if (locale === routing.defaultLocale) {
    return `${origin}/auth/callback`;
  }
  return `${origin}/${locale}/auth/callback`;
}
