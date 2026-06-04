import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import { getToslaConfig } from "@/lib/tosla-config";
import { createToslaCheckout } from "@/lib/tosla-payment";
import type { PlanType } from "@/types/database";
import { getAppBaseUrl } from "@/lib/app-url";

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

    const config = await getToslaConfig();
    if (!config.enabled) {
      return NextResponse.json(
        {
          error: "tosla_not_configured",
          message: "Tosla ödemesi admin panelden henüz aktif edilmedi.",
        },
        { status: 503 }
      );
    }

    const plan = PLANS[planType as PlanType];
    const baseUrl = getAppBaseUrl();
    const orderId = `zippr-${user.id.slice(0, 8)}-${Date.now()}`;

    const { checkoutUrl, threeDSessionId } = await createToslaCheckout(config, {
      amountTry: plan.price,
      orderId,
      customerEmail: user.email,
      description: `zippr.ink ${planType} — ₺${plan.price}`,
      returnUrl: `${baseUrl}/dashboard?payment=success`,
    });

    return NextResponse.json({ checkoutUrl, orderId, threeDSessionId });
  } catch (error) {
    console.error("Tosla checkout error:", error);
    return NextResponse.json(
      {
        error: "Checkout failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
