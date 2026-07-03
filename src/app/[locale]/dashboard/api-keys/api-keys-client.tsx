"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogoutButton } from "@/components/auth/logout-button";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ZipprLogo } from "@/components/brand/zippr-logo";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  mode: "test" | "live";
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
}

export default function ApiKeysClient() {
  const t = useTranslations("apiKeys");
  const tc = useTranslations("common");
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"live" | "test">("live");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadKeys = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard/api-keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    setNewKey(null);
    const res = await fetch("/api/dashboard/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || t("defaultKeyName"), mode }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(t("createError"));
      setCreating(false);
      return;
    }
    setNewKey(data.api_key);
    setName("");
    await loadKeys();
    setCreating(false);
  }

  async function revoke(id: string) {
    if (!confirm(t("revokeConfirm"))) return;
    await fetch(`/api/dashboard/api-keys/${id}`, { method: "DELETE" });
    await loadKeys();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ZipprLogo size="sm" linked />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <LogoutButton />
      </div>

      <DashboardNav />

      <p className="mb-6 text-sm text-white/60">{t("intro")}</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createKey} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name">{t("keyName")}</Label>
              <Input
                id="key-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("keyNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("mode")}</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "live" | "test")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">{t("modeLive")}</SelectItem>
                  <SelectItem value="test">{t("modeTest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={creating}>
              {creating ? tc("loading") : t("createButton")}
            </Button>
          </form>

          {newKey && (
            <div className="mt-6 rounded-lg border border-violet/40 bg-violet/10 p-4">
              <p className="mb-2 text-sm font-semibold text-violet-light">{t("keyShownOnce")}</p>
              <code className="block break-all rounded bg-black/40 p-3 text-xs text-white/90">
                {newKey}
              </code>
              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => navigator.clipboard.writeText(newKey)}
              >
                {t("copyKey")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-white/50">{tc("loading")}</p>
          ) : !keys.length ? (
            <p className="text-white/50">{t("noKeys")}</p>
          ) : (
            <ul className="space-y-4">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-4"
                >
                  <div>
                    <p className="font-medium">{k.name}</p>
                    <p className="font-mono text-xs text-white/50">
                      {k.key_prefix}… · {k.mode}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {t("usageCount", { count: k.usage_count })}
                      {k.last_used_at
                        ? ` · ${t("lastUsed")}: ${new Date(k.last_used_at).toLocaleString()}`
                        : ` · ${t("neverUsed")}`}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => revoke(k.id)}>
                    {t("revoke")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-white/50">
        <Link href="/api-docs" className="text-violet-light hover:underline">
          {t("readDocs")}
        </Link>
      </p>
    </div>
  );
}
