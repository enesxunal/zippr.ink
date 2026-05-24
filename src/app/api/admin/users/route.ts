import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStorageLimitForPlan } from "@/lib/plans";
import type { PlanType } from "@/types/database";

async function assertSuperAdmin() {
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

export async function PATCH(request: NextRequest) {
  const user = await assertSuperAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { userId, is_banned, plan_type } = body;

  const admin = createServiceClient();
  const updates: Record<string, unknown> = {};

  if (typeof is_banned === "boolean") updates.is_banned = is_banned;
  if (plan_type) {
    updates.plan_type = plan_type as PlanType;
    updates.storage_limit = getStorageLimitForPlan(plan_type as PlanType);
  }

  await admin.from("profiles").update(updates).eq("id", userId);
  return NextResponse.json({ success: true });
}
