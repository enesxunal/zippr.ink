import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";

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
  "api",
];

const protectedRoutes = ["/dashboard", "/admin", "/settings"];
const adminRoutes = ["/admin"];

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

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Rewrite custom slugs: /3kareajans -> /de/share/3kareajans
  const slugMatch = pathname.match(/^\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (!reserved.includes(slug) && !routing.locales.includes(slug as "de" | "en" | "tr")) {
      const url = request.nextUrl.clone();
      url.pathname = `/de/share/${slug}`;
      return NextResponse.rewrite(url);
    }
  }

  const intlResponse = intlMiddleware(request);

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
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathWithoutLocale = getPathWithoutLocale(pathname);

  const isProtected = protectedRoutes.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + "/")
  );
  const isAdmin = adminRoutes.some(
    (r) => pathWithoutLocale === r || pathWithoutLocale.startsWith(r + "/")
  );

  if (isProtected && !user) {
    const locale = getLocaleFromPath(pathname);
    const url = request.nextUrl.clone();
    url.pathname =
      locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (isAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "super_admin") {
      const locale = getLocaleFromPath(pathname);
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
