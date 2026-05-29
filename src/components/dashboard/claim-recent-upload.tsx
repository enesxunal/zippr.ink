"use client";

import { useEffect } from "react";
import { tryCreateClient } from "@/lib/supabase/client";
import { getUploadAuthHeaders } from "@/lib/upload-auth";
import {
  clearPendingUploadSlugs,
  getPendingUploadSlugs,
} from "@/lib/pending-upload-slugs";

export function ClaimRecentUpload() {
  useEffect(() => {
    async function claim() {
      const slugs = getPendingUploadSlugs();
      if (!slugs.length) return;

      const supabase = tryCreateClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const headers = await getUploadAuthHeaders();
      const res = await fetch("/api/files/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ slugs }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as {
        linked?: number;
        alreadyOwned?: string[];
      };

      const linked = data.linked ?? 0;
      const owned = data.alreadyOwned ?? [];
      const allAccountedFor = slugs.every(
        (s) => owned.includes(s) || (data as { slugs?: string[] }).slugs?.includes(s)
      );

      if (linked > 0 || allAccountedFor) {
        clearPendingUploadSlugs();
        if (linked > 0) window.location.reload();
      }
    }

    void claim();
  }, []);

  return null;
}

export { rememberUploadSlug } from "@/lib/pending-upload-slugs";
