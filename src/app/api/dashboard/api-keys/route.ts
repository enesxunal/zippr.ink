import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/api/v1/api-keys";
import type { ApiKeyMode, ApiKeyRecord } from "@/types/database";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const { data, error } = await admin
    .from("api_keys")
    .select("id, name, key_prefix, mode, last_used_at, usage_count, revoked_at, created_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ keys: data ?? [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "API Key").trim().slice(0, 80) || "API Key";
  const mode: ApiKeyMode = body.mode === "test" ? "test" : "live";

  const { rawKey, prefix, hash } = generateApiKey(mode);
  const admin = createServiceClient();

  const { data, error } = await admin
    .from("api_keys")
    .insert({
      user_id: user.id,
      name,
      key_prefix: prefix,
      key_hash: hash,
      mode,
    })
    .select("id, name, key_prefix, mode, created_at")
    .single<Pick<ApiKeyRecord, "id" | "name" | "key_prefix" | "mode" | "created_at">>();

  if (error || !data) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  return NextResponse.json({
    key: data,
    api_key: rawKey,
  });
}
