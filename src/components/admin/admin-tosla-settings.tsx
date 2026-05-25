"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminToslaSettings() {
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [clientId, setClientId] = useState("");
  const [apiUser, setApiUser] = useState("");
  const [merchantKey, setMerchantKey] = useState("");
  const [apiPassword, setApiPassword] = useState("");
  const [apiUrl, setApiUrl] = useState("https://entegrasyon.tosla.com/api/Payment/");
  const [hasPassword, setHasPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/tosla")
      .then((r) => r.json())
      .then((d) => {
        setEnabled(Boolean(d.enabled));
        setTestMode(Boolean(d.testMode));
        setClientId(d.clientId || "");
        setApiUser(d.apiUser || "");
        setMerchantKey(d.merchantKey || "");
        setApiUrl(d.apiUrl || "https://entegrasyon.tosla.com/api/Payment/");
        setHasPassword(Boolean(d.hasPassword));
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/admin/settings/tosla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        testMode,
        clientId,
        apiUser,
        merchantKey,
        apiPassword: apiPassword || undefined,
        apiUrl,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg(t("toslaSaved"));
      setApiPassword("");
      setHasPassword(true);
    } else {
      setMsg(t("toslaError"));
    }
  }

  if (loading) return <p className="text-white/50">{t("toslaLoading")}</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("toslaTitle")}</CardTitle>
        <p className="text-sm text-white/50">{t("toslaDesc")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {t("toslaEnabled")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={testMode}
            onChange={(e) => setTestMode(e.target.checked)}
          />
          {t("toslaTestMode")}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("toslaClientId")}</Label>
            <Input value={clientId} onChange={(e) => setClientId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("toslaApiUser")}</Label>
            <Input value={apiUser} onChange={(e) => setApiUser(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("toslaMerchantKey")}</Label>
            <Input value={merchantKey} onChange={(e) => setMerchantKey(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("toslaApiPassword")}</Label>
            <Input
              type="password"
              value={apiPassword}
              placeholder={hasPassword ? "••••••••" : ""}
              onChange={(e) => setApiPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("toslaApiUrl")}</Label>
            <Input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
          </div>
        </div>
        {msg && <p className="text-sm text-violet-light">{msg}</p>}
        <Button onClick={save} disabled={saving}>
          {saving ? t("toslaSaving") : t("toslaSave")}
        </Button>
      </CardContent>
    </Card>
  );
}
