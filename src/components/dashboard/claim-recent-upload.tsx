"use client";

import { useEffect } from "react";
import { tryCreateClient } from "@/lib/supabase/client";
import { getUploadAuthHeaders } from "@/lib/upload-auth";
import { clearPendingUploadSlugs, getPendingUploadClaims } from "@/lib/pending-upload-slugs";

export function ClaimRecentUpload() {
  useEffect(() => {
    async function claim() {
      const claims = getPendingUploadClaims();
      if (!claims.length) return;

      const supabase = tryCreateClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const headers = await getUploadAuthHeaders();
      const res = await fetch("/api/files/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ claims }),
      });
      if (!res.ok) return;

      const data = (await res.json()) as { linked?: number; completed?: boolean };
      if (data.completed) {
        clearPendingUploadSlugs();
        if ((data.linked ?? 0) > 0) window.location.reload();
      }
    }
    void claim();
  }, []);

  return null;
}

export { rememberUploadSlug } from "@/lib/pending-upload-slugs";
