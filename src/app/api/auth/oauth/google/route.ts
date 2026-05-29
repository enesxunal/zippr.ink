import { type NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";
import { createSupabaseRouteClient } from "@/lib/supabase/route-cookies";

export const runtime = "nodejs";

/** Google OAuth başlatır; PKCE code verifier çerez olarak yazılır */
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const callbackUrl = `${origin}/auth/callback`;
  const fallback = new URL("/login?error=auth", origin);

  const response = NextResponse.redirect(fallback);
  const supabase = createSupabaseRouteClient(request, response);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    console.error("oauth google start:", error?.message);
    return response;
  }

  response.headers.set("Location", data.url);
  return response;
}
