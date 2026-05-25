import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin-constants";
import { getRequestOrigin } from "@/lib/app-url";

export const runtime = "nodejs";

function resolveLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && routing.locales.includes(cookie as "de" | "en" | "tr")) {
    return cookie;
  }
  return "tr";
}

function localePath(locale: string, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path}`;
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

/** Google OAuth dönüşü — /api üzerinden, middleware locale karışmaz */
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const locale = resolveLocale(request);

  const loginUrl = new URL(localePath(locale, "/login"), origin);
  loginUrl.searchParams.set("error", "auth");

  if (!code) {
    return NextResponse.redirect(loginUrl);
  }

  const dashboardUrl = new URL(localePath(locale, "/dashboard"), origin);
  let response = NextResponse.redirect(dashboardUrl);

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(
            cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]
          ) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("api auth callback exchange:", error.message);
      return NextResponse.redirect(loginUrl);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && isAdminEmail(user.email)) {
      const adminUrl = new URL(localePath(locale, "/admin"), origin);
      const adminResponse = NextResponse.redirect(adminUrl);
      copyCookies(response, adminResponse);
      response = adminResponse;
    }

    return response;
  } catch (e) {
    console.error("api auth callback:", e);
    return NextResponse.redirect(loginUrl);
  }
}
