"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="min-h-screen bg-black text-white antialiased">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-20 text-center">
          <h1 className="text-xl font-semibold">Bir şeyler ters gitti</h1>
          <p className="text-sm text-white/60">
            Hata kaydedildi. Sayfayı yenileyip tekrar deneyebilirsin.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-lg bg-violet px-4 py-2 text-sm font-medium text-white"
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
