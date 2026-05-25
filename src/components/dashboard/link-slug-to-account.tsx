"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUploadAuthHeaders } from "@/lib/upload-auth";

export function LinkSlugToAccount() {
  const t = useTranslations("dashboard");
  const [slug, setSlug] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    const code = slug.trim().replace(/^.*\//, "");
    if (!code) return;
    setLoading(true);
    setMsg("");
    try {
      const headers = await getUploadAuthHeaders();
      const res = await fetch("/api/files/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ slugs: [code] }),
      });
      const data = await res.json();
      if (res.ok && data.linked > 0) {
        setMsg(t("linkAdded"));
        window.location.reload();
      } else {
        setMsg(t("linkNotFound"));
      }
    } catch {
      setMsg(t("linkNotFound"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="min-w-[200px] flex-1">
        <p className="mb-1 text-sm font-medium">{t("addLinkToPanel")}</p>
        <Input
          placeholder="onoarkldt6e1"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>
      <Button onClick={handleClaim} disabled={loading}>
        {loading ? "…" : t("addLink")}
      </Button>
      {msg && <p className="w-full text-sm text-white/60">{msg}</p>}
    </div>
  );
}
