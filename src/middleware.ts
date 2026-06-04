import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { isAdminEmail } from "./lib/admin-constants";
import { applyCookiesToResponse } from "./lib/supabase/route-cookies";

const intlMiddleware = createMiddleware(routing);

const reserved = [
  "dashboard",
  "admin",
  "login",
  "register",
  "pricing",
  "enterprise",
  "auth",
  "settings",
  "support",
  "share",
  "tools",
  "api",
  "sentry-example-page",
];

const protectedRoutes = ["/dashboard", "/settings"];

function getPathWithoutLocale(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const isLocale = segments[0] && routing.locales.includes(segments[0] as "de" | "en" | "tr");
  if (isLocale) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname;
}

function getLocaleFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] && routing.locales.includes(segments[0] as "de" | "en" | "tr")) {
    return segments[0];
  }
  return routing.defaultLocale;
}

function isPublicPath(pathWithoutLocale: string) {
  if (pathWithoutLocale === "/" || pathWithoutLocale === "") return true;
  if (
    pathWithoutLocale === "/login" ||
    pathWithoutLocale === "/register" ||
    pathWithoutLocale === "/pricing" ||
    pathWithoutLocale === "/enterprise"
  ) {
    return true;
  }
  if (pathWithoutLocale.startsWith("/tools/") || pathWithoutLocale.startsWith("/share/")) {
    return true;
  }
  if (pathWithoutLocale === "/sentry-example-page") return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const pathWithoutLocaleEarly = getPathWithoutLocale(pathname);

  if (pathWithoutLocaleEarly === "/sentry-example-page") {
    return NextResponse.next();
  }

  if (
    pathWithoutLocaleEarly === "/auth/callback" ||
    pathWithoutLocaleEarly.startsWith("/auth/callback/")
  ) {
    if (pathname !== "/auth/callback") {
      const dest = request.nextUrl.clone();
      dest.pathname = "/auth/callback";
      return NextResponse.redirect(dest);
    }
    return NextResponse.next();
  }

  const slugMatch = pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (!reserved.includes(slug) && !routing.locales.includes(slug as "de" | "en" | "tr")) {
      const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
      const locale =
        cookieLocale && routing.locales.includes(cookieLocale as "de" | "en" | "tr")
          ? cookieLocale
          : routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/share/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  const intlResponse = intlMiddleware(request);
  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const isAdminLogin = pathWithoutLocale === "/admin/login";
  const isAdminPanel =
    pathWithoutLocale === "/admin" ||
    (pathWithoutLocale.startsWith("/admin/") && !isAdminLogin);
  const isProtected = protectedRoutes.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + "/")
  );

  // Ana sayfa ve giriş gibi herkese açık sayfalarda Supabase çağırma (site kilitlenmesin)
  if (isPublicPath(pathWithoutLocale) && !isProtected && !isAdminPanel && !isAdminLogin) {
    return intlResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return intlResponse;
  }

  let supabaseResponse = intlResponse;
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
      ) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        applyCookiesToResponse(supabaseResponse, cookiesToSet);
      },
    },
  });

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return intlResponse;
  }

  const locale = getLocaleFromPath(pathname);

  async function userIsSuperAdmin() {
    if (!user) return false;
    if (isAdminEmail(user.email)) return true;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      return profile?.role === "super_admin";
    } catch {
      return false;
    }
  }

  if (isAdminLogin) {
    if (await userIsSuperAdmin()) {
      const url = request.nextUrl.clone();
      url.pathname =
        locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname =
      locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (
    isProtected &&
    user &&
    (pathWithoutLocale === "/dashboard" || pathWithoutLocale.startsWith("/dashboard/"))
  ) {
    if (await userIsSuperAdmin()) {
      const url = request.nextUrl.clone();
      url.pathname =
        locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;
      return NextResponse.redirect(url);
    }
  }

  if (isAdminPanel && !user) {
    const url = request.nextUrl.clone();
    url.pathname =
      locale === routing.defaultLocale
        ? "/admin/login"
        : `/${locale}/admin/login`;
    return NextResponse.redirect(url);
  }

  if (isAdminPanel && user) {
    const allowed = await userIsSuperAdmin();
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname =
        locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
