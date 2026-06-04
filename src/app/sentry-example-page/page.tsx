"use client";

/** Sentry kurulum testi — Sentry panelinde "Verify" için bu sayfayı aç. */
export default function SentryExamplePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <p className="text-white/60">zippr.ink — Sentry test</p>
      <button
        type="button"
        className="rounded-lg bg-violet px-6 py-3 font-medium"
        onClick={() => {
          throw new Error("Sentry Test Error — zippr.ink");
        }}
      >
        Test hatası üret
      </button>
    </div>
  );
}
