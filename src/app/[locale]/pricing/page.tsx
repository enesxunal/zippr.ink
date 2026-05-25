"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { PLANS, PAID_PLANS } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { PlanType } from "@/types/database";

export default function PricingPage() {
  const t = useTranslations("pricing");
  const tc = useTranslations("common");

  const plans: PlanType[] = ["free", "lite", "standard", "professional", "enterprise"];

  async function checkout(plan: PlanType) {
    if (plan === "free" || plan === "enterprise") return;
    const res = await fetch("/api/payments/tosla/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ planType: plan }),
    });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else alert(data.message || data.error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="mb-12 text-center text-3xl font-bold">{t("title")}</h1>
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {plans.map((plan) => {
          const config = PLANS[plan];
          const isPaid = PAID_PLANS.includes(plan as typeof PAID_PLANS[number]);
          return (
            <Card
              key={plan}
              className={plan === "standard" ? "border-violet/50 ring-1 ring-violet/30" : ""}
            >
              <CardHeader>
                <CardTitle className="text-lg">{t(plan)}</CardTitle>
                {plan !== "enterprise" ? (
                  <p className="text-2xl font-bold text-violet-light">
                    {config.price === 0 ? "€0" : `€${config.price}`}
                    {config.price > 0 && (
                      <span className="text-sm font-normal text-white/50">{t("perMonth")}</span>
                    )}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {(t.raw(`planFeatures.${plan}`) as string[]).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-light" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan === "enterprise" ? (
                  <Link href="/enterprise">
                    <Button variant="secondary" className="w-full">
                      {t("contactUs")}
                    </Button>
                  </Link>
                ) : isPaid ? (
                  <Button className="w-full" onClick={() => checkout(plan)}>
                    {tc("getStarted")}
                  </Button>
                ) : (
                  <Link href="/register">
                    <Button variant="secondary" className="w-full">
                      {tc("getStarted")}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
