"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUploadAuthHeaders } from "@/lib/upload-auth";

const STORAGE_KEY = "zippr_pending_slugs";

export function ClaimRecentUpload() {
  useEffect(() => {
    async function claim() {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      let slugs: string[] = [];
      try {
        slugs = JSON.parse(raw) as string[];
      } catch {
        return;
      }
      if (!slugs.length) return;

      const supabase = createClient();
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

      if (res.ok) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    }

    void claim();
  }, []);

  return null;
}

export function rememberUploadSlug(slug: string) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(slug)) list.unshift(slug);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 5)));
  } catch {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([slug]));
  }
}
