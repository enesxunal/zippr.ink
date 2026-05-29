import { getClientAppOrigin } from "@/lib/app-url";

/** Google OAuth dönüş adresi (Supabase redirect listesinde olmalı) */
export function getAuthCallbackUrl(): string {
  return `${getClientAppOrigin()}/auth/callback`;
}

/** Sunucuda PKCE çerezi yazılır */
export function getGoogleOAuthStartPath(): string {
  return "/api/auth/oauth/google";
}
