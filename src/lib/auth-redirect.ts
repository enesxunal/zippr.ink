import { getClientAppOrigin } from "@/lib/app-url";

/** Google OAuth — tek sabit URL (locale/middleware karışmaz) */
export function getAuthCallbackUrl(_origin?: string, _locale?: string): string {
  return `${getClientAppOrigin()}/api/auth/callback`;
}
