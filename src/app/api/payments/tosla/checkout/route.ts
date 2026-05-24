import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import type { PlanType } from "@/types/database";

/**
 * Tosla Payment Gateway — Checkout skeleton
 * Configure in .env.local:
 * - TOSLA_MERCHANT_ID
 * - TOSLA_MERCHANT_KEY
 * - TOSLA_API_URL
 * - TOSLA_CALLBACK_URL
 */
export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json();

    if (!PAID_PLANS.includes(planType)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = PLANS[planType as PlanType];
    const merchantId = process.env.TOSLA_MERCHANT_ID;
    const merchantKey = process.env.TOSLA_MERCHANT_KEY;
    const apiUrl = process.env.TOSLA_API_URL || "https://api.tosla.com/v1";
    const callbackUrl =
      process.env.TOSLA_CALLBACK_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/tosla/webhook`;

    if (!merchantId || !merchantKey) {
      return NextResponse.json(
        {
          error: "Tosla not configured",
          skeleton: true,
          plan: planType,
          amount: plan.price,
          currency: plan.currency,
          message: "Add TOSLA_MERCHANT_ID and TOSLA_MERCHANT_KEY to .env.local",
        },
        { status: 503 }
      );
    }

    const orderId = `zippr-${user.id.slice(0, 8)}-${Date.now()}`;

    // TODO: Replace with actual Tosla API call
    const paymentPayload = {
      merchantId,
      orderId,
      amount: plan.price * 100,
      currency: plan.currency,
      callbackUrl,
      customerEmail: user.email,
      description: `zippr.ink ${planType} subscription`,
    };

    const toslaResponse = await fetch(`${apiUrl}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${merchantKey}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!toslaResponse.ok) {
      const err = await toslaResponse.text();
      return NextResponse.json({ error: "Tosla API error", details: err }, { status: 502 });
    }

    const paymentData = await toslaResponse.json();

    return NextResponse.json({
      checkoutUrl: paymentData.checkoutUrl || paymentData.redirectUrl,
      orderId,
    });
  } catch (error) {
    console.error("Tosla checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
