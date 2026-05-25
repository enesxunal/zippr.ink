import type { NextRequest } from "next/server";
import { readPublicEnv } from "@/lib/supabase/public-env";

const PRODUCTION_HOST = "zippr.ink";

function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

/** Build-time / server env — must be https://zippr.ink on production. */
export function getAppBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return normalizeBase(fromEnv);

  if (typeof window !== "undefined") {
    const fromMeta = readPublicEnv("zippr-app-url").trim();
    if (fromMeta) return normalizeBase(fromMeta);
    return window.location.origin;
  }

  return `https://${PRODUCTION_HOST}`;
}

/** Browser: prefer live origin on zippr.ink, meta tag if env was localhost at build. */
export function getClientAppOrigin(): string {
  if (typeof window === "undefined") return getAppBaseUrl();

  const host = window.location.hostname;
  if (host === PRODUCTION_HOST || host.endsWith(`.${PRODUCTION_HOST}`)) {
    return window.location.origin;
  }

  const fromMeta = readPublicEnv("zippr-app-url").trim();
  if (fromMeta && !fromMeta.includes("localhost")) {
    return normalizeBase(fromMeta);
  }

  return window.location.origin;
}

/**
 * Real public origin behind Nginx/PM2 (fixes OAuth redirect to localhost:3000).
 */
export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const hostHeader = request.headers.get("host");
  const host = (forwardedHost || hostHeader || "").split(",")[0]?.trim();

  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (request.nextUrl.protocol === "https:" ? "https" : "http");

  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }

  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envBase && !envBase.includes("localhost")) {
    return normalizeBase(envBase);
  }

  return request.nextUrl.origin;
}

export function getPublicFileUrl(slug: string, request?: NextRequest): string {
  const base = request ? getRequestOrigin(request) : getAppBaseUrl();
  return `${normalizeBase(base)}/${slug}`;
}
