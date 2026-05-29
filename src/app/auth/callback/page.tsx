"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin-constants";

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const code = searchParams.get("code");
    if (!code) {
      window.location.replace("/login?error=auth");
      return;
    }

    const supabase = createClient();

    void (async () => {
      try {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("auth callback exchange:", exchangeError.message);
          setError(exchangeError.message);
          setTimeout(() => window.location.replace("/login?error=auth"), 2500);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user?.email?.trim().toLowerCase() === ADMIN_EMAIL) {
          window.location.replace("/admin");
          return;
        }

        window.location.replace("/dashboard");
      } catch (e) {
        console.error("auth callback:", e);
        setError("Giriş tamamlanamadı.");
        setTimeout(() => window.location.replace("/login?error=auth"), 2500);
      }
    })();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
      {error ? (
        <p className="max-w-md text-sm text-red-400">{error}</p>
      ) : (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          <p className="text-white/60">Giriş tamamlanıyor…</p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <p className="text-white/60">Giriş tamamlanıyor…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
