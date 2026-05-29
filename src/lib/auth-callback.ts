import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin-constants";
import { getRequestOrigin } from "@/lib/app-url";
import {
  copyResponseCookies,
  createSupabaseCallbackClient,
} from "@/lib/supabase/route-cookies";

export async function handleAuthCallback(request: NextRequest, locale: string) {
  const origin = getRequestOrigin(request);
  const code = new URL(request.url).searchParams.get("code");

  const loginPath =
    locale === routing.defaultLocale ? "/login" : `/${locale}/login`;
  const dashboardPath =
    locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
  const adminPath =
    locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;

  const loginUrl = new URL(loginPath, origin);
  loginUrl.searchParams.set("error", "auth");

  if (!code) {
    console.error("[auth callback] missing code param");
    return NextResponse.redirect(loginUrl);
  }

  const dashboardUrl = new URL(dashboardPath, origin);
  const response = NextResponse.redirect(dashboardUrl);

  try {
    const supabase = await createSupabaseCallbackClient(request, response);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth callback] exchangeCodeForSession:", error.message);
      return NextResponse.redirect(loginUrl);
    }

    const user = data.session?.user;
    if (user && isAdminEmail(user.email)) {
      const adminResponse = NextResponse.redirect(new URL(adminPath, origin));
      copyResponseCookies(response, adminResponse);
      return adminResponse;
    }

    return response;
  } catch (e) {
    console.error("[auth callback] unhandled:", e);
    return NextResponse.redirect(loginUrl);
  }
}
