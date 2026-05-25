import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getToslaConfig, saveToslaConfig } from "@/lib/tosla-config";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") return null;
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
  const admin = await assertAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const current = await getToslaConfig();

  await saveToslaConfig({
    enabled: Boolean(body.enabled),
    clientId: String(body.clientId || ""),
    apiUser: String(body.apiUser || ""),
    merchantKey: String(body.merchantKey || ""),
    apiPassword: body.apiPassword ? String(body.apiPassword) : current.apiPassword,
    apiUrl: String(body.apiUrl || current.apiUrl),
    testMode: Boolean(body.testMode),
  });

  return NextResponse.json({ ok: true });
}
