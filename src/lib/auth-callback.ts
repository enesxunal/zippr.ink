import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin-constants";
import { getRequestOrigin } from "@/lib/app-url";

export async function handleAuthCallback(request: NextRequest, locale: string) {
  const url = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = url.searchParams.get("code");
  const nextPath =
    url.searchParams.get("next") ??
    (locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`);

  const redirectUrl = new URL(nextPath, origin);
  const response = NextResponse.redirect(redirectUrl);

  if (!code) {
    const loginPath = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(new URL(`${loginPath}?error=auth`, origin));
  }

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
    const loginPath = locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
    return NextResponse.redirect(new URL(`${loginPath}?error=auth`, origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && isAdminEmail(user.email)) {
    const adminPath =
      locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;
    return NextResponse.redirect(new URL(adminPath, origin));
  }

  return response;
}
