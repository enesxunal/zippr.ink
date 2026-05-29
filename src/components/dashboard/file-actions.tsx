"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Copy, Trash2 } from "lucide-react";
import { getUploadAuthHeaders } from "@/lib/upload-auth";

interface FileActionsProps {
  slug: string;
  shareUrl: string;
}

export function FileActions({ slug, shareUrl }: FileActionsProps) {
  const t = useTranslations("common");
  const td = useTranslations("dashboard");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function revoke() {
    if (!confirm(td("revokeLink") + "?")) return;
    const headers = await getUploadAuthHeaders();
    const res = await fetch(`/api/download/${slug}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });
    if (!res.ok) return;
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={copy} title={t("copyLink")}>
        <Copy className="h-4 w-4" />
        {copied && <span className="sr-only">{t("copied")}</span>}
      </Button>
      <Button size="sm" variant="ghost" onClick={revoke} title={td("revokeLink")}>
        <Trash2 className="h-4 w-4 text-red-400" />
      </Button>
    </div>
  );
}
