import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/app-url";

export const runtime = "nodejs";

/**
 * Google OAuth başlatır; PKCE code verifier HTTP-only çerez olarak sunucuda yazılır.
 */
export async function GET(request: NextRequest) {
  const origin = getRequestOrigin(request);
  const callbackUrl = `${origin}/auth/callback`;
  const fallback = new URL("/login?error=auth", origin);

  const response = NextResponse.redirect(fallback);

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
