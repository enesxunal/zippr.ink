"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PlanType } from "@/types/database";

interface Props {
  userId: string;
  isBanned: boolean;
  plan: PlanType;
}

const PLANS: PlanType[] = ["free", "lite", "standard", "professional", "enterprise"];

export function AdminUserActions({ userId, isBanned, plan }: Props) {
  const t = useTranslations("admin");
  const tp = useTranslations("pricing");

  async function toggleBan() {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, is_banned: !isBanned }),
    });
    window.location.reload();
  }

  async function changePlan(newPlan: PlanType) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plan_type: newPlan }),
    });
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={plan} onValueChange={(v) => changePlan(v as PlanType)}>
        <SelectTrigger className="h-8 w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PLANS.map((p) => (
            <SelectItem key={p} value={p}>
              {tp(p)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant={isBanned ? "outline" : "destructive"} onClick={toggleBan}>
        {isBanned ? t("unbanUser") : t("banUser")}
      </Button>
    </div>
  );
}
