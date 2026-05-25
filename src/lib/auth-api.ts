import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/admin";

/** Resolves user from Bearer token (reliable in API routes) or request cookies. */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string | null> {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) {
    try {
      const admin = createServiceClient();
      const { data, error } = await admin.auth.getUser(auth.slice(7));
      if (!error && data.user) return data.user.id;
    } catch {
      // fall through to cookies
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // Route handlers: read-only cookie access
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
