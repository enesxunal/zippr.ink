import { getClientAppOrigin } from "@/lib/app-url";

/** Google OAuth — tarayıcıda PKCE tamamlanır (/auth/callback sayfası) */
export function getAuthCallbackUrl(_origin?: string, _locale?: string): string {
  return `${getClientAppOrigin()}/auth/callback`;
}
