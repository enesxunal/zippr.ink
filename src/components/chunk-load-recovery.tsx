"use client";

import { useEffect } from "react";

const RELOAD_KEY = "zippr-chunk-reload";

function shouldReload(message: string) {
  return (
    message.includes("ChunkLoadError") ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module")
  );
}

/** Deploy sonrası eski JS önbelleği → sert yenileme (Ctrl+R yetmez) */
function hardReload() {
  const attempts = Number(sessionStorage.getItem(RELOAD_KEY) || "0");
  if (attempts >= 2) return;

  sessionStorage.setItem(RELOAD_KEY, String(attempts + 1));

  const url = new URL(window.location.href);
  url.searchParams.set("_cb", String(Date.now()));
  window.location.replace(url.toString());
}

export function ChunkLoadRecovery() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      const msg = event.message || "";
      if (shouldReload(msg)) hardReload();
    }

    function onRejection(event: PromiseRejectionEvent) {
      const msg = String(event.reason?.message || event.reason || "");
      if (shouldReload(msg)) hardReload();
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    // Sayfa sorunsuz açıldıysa sayaç sıfırlansın
    const timer = window.setTimeout(() => {
      sessionStorage.removeItem(RELOAD_KEY);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
