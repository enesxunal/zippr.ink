import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getToslaConfig, saveToslaConfig } from "@/lib/tosla-config";
import { isSuperAdmin } from "@/lib/admin-access";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  if (!(await isSuperAdmin(user.id, user.email))) return null;
  return user;
}

export async function GET() {
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const config = await getToslaConfig();
  return NextResponse.json({
    enabled: config.enabled,
    clientId: config.clientId,
    apiUser: config.apiUser,
    merchantKey: config.merchantKey,
    hasPassword: !!config.apiPassword,
    apiUrl: config.apiUrl,
    testMode: config.testMode,
  });
}

export async function POST(request: NextRequest) {
  try {
    const admin = await assertAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const current = await getToslaConfig();

    const apiPassword = body.apiPassword
      ? String(body.apiPassword).trim()
      : current.apiPassword;

    if (!String(body.clientId || "").trim() || !String(body.apiUser || "").trim()) {
      return NextResponse.json(
        { error: "client_id_and_api_user_required" },
        { status: 400 }
      );
    }

    if (!apiPassword) {
      return NextResponse.json({ error: "api_password_required" }, { status: 400 });
    }

    await saveToslaConfig({
      enabled: Boolean(body.enabled),
      clientId: String(body.clientId || "").trim(),
      apiUser: String(body.apiUser || "").trim(),
      merchantKey: String(body.merchantKey || "").trim(),
      apiPassword,
      apiUrl: String(body.apiUrl || current.apiUrl).trim(),
      testMode: Boolean(body.testMode),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "save_failed";
    console.error("Tosla settings save:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
