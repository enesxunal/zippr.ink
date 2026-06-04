"use client";

import { useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

/** Sentry kurulum testi — hata sayfasına düşmeden Sentry'ye gönderir */
export default function SentryExamplePage() {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const [detail, setDetail] = useState("");

  async function sendTestError() {
    setStatus("sending");
    setDetail("");

    const err = new Error("Sentry Test Error — zippr.ink");

    try {
      Sentry.captureException(err);
      const eventId = Sentry.lastEventId();

      const res = await fetch("/api/sentry-test", { method: "POST" }).catch(() => null);

      if (eventId || res?.ok) {
        setStatus("ok");
        setDetail(
          eventId
            ? `Gönderildi. Event ID: ${eventId}`
            : "Sunucu testi de gönderildi. Sentry → Issues sayfasını kontrol et."
        );
      } else {
        setStatus("fail");
        setDetail(
          "DSN eksik olabilir. Sunucu .env.local içinde NEXT_PUBLIC_SENTRY_DSN var mı kontrol et."
        );
      }
    } catch (e) {
      setStatus("fail");
      setDetail(e instanceof Error ? e.message : "Gönderilemedi");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-6 text-white">
      <p className="text-white/60">zippr.ink — Sentry test</p>
      <button
        type="button"
        disabled={status === "sending"}
        className="rounded-lg bg-violet px-6 py-3 font-medium disabled:opacity-50"
        onClick={() => void sendTestError()}
      >
        {status === "sending" ? "Gönderiliyor…" : "Test hatası üret"}
      </button>
      {detail && (
        <p
          className={`max-w-md text-center text-sm ${status === "ok" ? "text-green-400" : "text-amber-300"}`}
        >
          {detail}
        </p>
      )}
      <Link href="/" className="text-sm text-violet-light underline">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
