import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStorageLimitForPlan } from "@/lib/plans";
import type { PlanType } from "@/types/database";
import crypto from "crypto";

/**
 * Tosla Webhook — validates signature and provisions subscription
 * Set TOSLA_WEBHOOK_SECRET in .env.local
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-tosla-signature");
    const webhookSecret = process.env.TOSLA_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(body)
        .digest("hex");

      if (signature !== expected) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(body);
    const { status, userId, planType, transactionId, amount } = payload;

    if (status !== "success" && status !== "completed") {
      return NextResponse.json({ received: true, action: "ignored" });
    }

    const admin = createServiceClient();
    const validPlans: PlanType[] = ["lite", "standard", "professional"];
    const plan = validPlans.includes(planType) ? planType : "lite";

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await admin.from("subscriptions").insert({
      user_id: userId,
      status: "active",
      plan_type: plan,
      price: amount || 0,
      currency: "EUR",
      billing_cycle: "monthly",
      gateway_transaction_id: transactionId,
      current_period_end: periodEnd.toISOString(),
    });

    await admin
      .from("profiles")
      .update({
        plan_type: plan,
        storage_limit: getStorageLimitForPlan(plan),
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tosla webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
