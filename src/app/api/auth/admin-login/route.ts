import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createServiceClient } from "@/lib/supabase/admin";

const ADMIN_EMAIL = "admin@zippr.ink";

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

    const admin = createServiceClient();
    let { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile && email === ADMIN_EMAIL) {
      await admin.from("profiles").upsert(
        {
          id: userId,
          email: ADMIN_EMAIL,
          full_name: "Admin",
          role: "super_admin",
          plan_type: "professional",
          storage_limit: 1099511627776,
        },
        { onConflict: "id" }
      );
      profile = { role: "super_admin" as const };
    }

    if (email === ADMIN_EMAIL && profile?.role !== "super_admin") {
      await admin.from("profiles").update({ role: "super_admin" }).eq("id", userId);
      profile = { role: "super_admin" as const };
    }

    if (profile?.role !== "super_admin") {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "not_authorized" }, { status: 403 });
    }

    return jsonResponse;
  } catch (e) {
    console.error("admin-login:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
