"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function EnterprisePage() {
  const t = useTranslations("enterprise");
  const [form, setForm] = useState({
    company_name: "",
    email: "",
    user_count: 5,
    requested_storage_gb: 500,
  });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.from("quotes").insert(form);
    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
            <p>{t("success")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("companyName")}</Label>
              <Input
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("userCount")}</Label>
              <Input
                type="number"
                min={1}
                value={form.user_count}
                onChange={(e) => setForm({ ...form, user_count: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("storageNeeded")}</Label>
              <Input
                type="number"
                min={100}
                value={form.requested_storage_gb}
                onChange={(e) =>
                  setForm({ ...form, requested_storage_gb: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
