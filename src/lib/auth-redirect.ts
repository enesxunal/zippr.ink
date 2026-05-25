import { getClientAppOrigin } from "@/lib/app-url";

/** Google OAuth dönüş adresi */
export function getAuthCallbackUrl(): string {
  return `${getClientAppOrigin()}/auth/callback`;
}
