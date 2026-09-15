import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStorageLimitForPlan } from "@/lib/plans";
import { getToslaConfig } from "@/lib/tosla-config";
import { getToslaCallbackField, isSuccessfulToslaCallback, verifyToslaCallbackHash, type ToslaCallbackPayload } from "@/lib/tosla-callback";
import type { PlanType } from "@/types/database";

async function parsePayload(request: NextRequest): Promise<ToslaCallbackPayload> {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const data = await request.json();
    return Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v ?? "")]));
  }
  const form = await request.formData();
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]));
}

export async function POST(request: NextRequest) {
  try {
    const payload = await parsePayload(request);
    const config = await getToslaConfig();
    if (!verifyToslaCallbackHash(payload, config.apiPassword)) {
      return NextResponse.json({ error: "invalid_callback_hash" }, { status: 401 });
    }

    const orderId = getToslaCallbackField(payload, "OrderId", "orderId");
    const transactionId = getToslaCallbackField(payload, "TransactionId", "transactionId", "ThreeDSessionId", "threeDSessionId");
    if (!orderId) return NextResponse.json({ error: "missing_order_id" }, { status: 400 });

    const admin = createServiceClient();
    const { data: intent } = await admin
      .from("payment_intents")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (!intent) return NextResponse.json({ error: "unknown_order" }, { status: 404 });
    if (intent.status === "completed") return NextResponse.json({ success: true, duplicate: true });

    if (!isSuccessfulToslaCallback(payload)) {
      await admin.from("payment_intents").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", intent.id);
      return NextResponse.json({ received: true, action: "payment_failed" });
    }

    const callbackAmount = Number(getToslaCallbackField(payload, "Amount", "amount") || 0);
    const expectedKurus = Math.round(Number(intent.amount) * 100);
    if (callbackAmount && callbackAmount !== expectedKurus) {
      return NextResponse.json({ error: "amount_mismatch" }, { status: 400 });
    }

    const plan = intent.plan_type as PlanType;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: subscriptionError } = await admin.from("subscriptions").insert({
      user_id: intent.user_id,
      status: "active",
      plan_type: plan,
      price: intent.amount,
      currency: "TRY",
      billing_cycle: "monthly",
      gateway_transaction_id: transactionId || orderId,
      current_period_end: periodEnd.toISOString(),
    });

    if (subscriptionError && !subscriptionError.message.toLowerCase().includes("duplicate")) {
      throw subscriptionError;
    }

    await admin.from("profiles").update({
      plan_type: plan,
      storage_limit: getStorageLimitForPlan(plan),
    }).eq("id", intent.user_id);

    await admin.from("payment_intents").update({
      status: "completed",
      gateway_transaction_id: transactionId || orderId,
      updated_at: new Date().toISOString(),
    }).eq("id", intent.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tosla webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
