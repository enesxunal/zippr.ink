"use client";

import { useEffect } from "react";

/** Deploy sonrası eski chunk cache → otomatik sayfa yenileme */
export function ChunkLoadRecovery() {
  useEffect(() => {
    function shouldReload(message: string) {
      return (
        message.includes("ChunkLoadError") ||
        message.includes("Loading chunk") ||
        message.includes("Failed to fetch dynamically imported module")
      );
    }

    function onError(event: ErrorEvent) {
      const msg = event.message || "";
      if (shouldReload(msg)) {
        const key = "zippr-chunk-reload";
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
        }
      }
    }

    function onRejection(event: PromiseRejectionEvent) {
      const msg = String(event.reason?.message || event.reason || "");
      if (shouldReload(msg)) {
        const key = "zippr-chunk-reload";
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          window.location.reload();
        }
      }
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    sessionStorage.removeItem("zippr-chunk-reload");

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
