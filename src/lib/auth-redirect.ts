import { getClientAppOrigin } from "@/lib/app-url";

const PRODUCTION_CALLBACK = "https://zippr.ink/auth/callback";

/** Google OAuth dönüş adresi — Supabase redirect listesinde olmalı */
export function getAuthCallbackUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "zippr.ink" || host.endsWith(".zippr.ink")) {
      return PRODUCTION_CALLBACK;
    }
  }
  const base = getClientAppOrigin();
  if (base.includes("zippr.ink")) {
    return PRODUCTION_CALLBACK;
  }
  return `${base.replace(/\/$/, "")}/auth/callback`;
}
