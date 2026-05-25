import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSuperAdmin } from "@/lib/admin-access";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const jsonResponse = NextResponse.json({ ok: true });

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
              jsonResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: authData, error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signError) {
      const msg = signError.message.toLowerCase();
      if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
      }
      return NextResponse.json({ error: "auth_failed", detail: signError.message }, { status: 401 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "auth_failed" }, { status: 401 });
    }

    const allowed = await isSuperAdmin(userId, email);
    if (!allowed) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "not_authorized" }, { status: 403 });
    }

    return jsonResponse;
  } catch (e) {
    console.error("admin-login:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
