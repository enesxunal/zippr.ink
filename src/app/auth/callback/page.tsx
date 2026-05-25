"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin-constants";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      router.replace("/login?error=auth");
      return;
    }

    const supabase = createClient();

    void (async () => {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("auth callback:", exchangeError.message);
        setError(exchangeError.message);
        setTimeout(() => router.replace("/login?error=auth"), 2000);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email?.trim().toLowerCase() === ADMIN_EMAIL) {
        window.location.href = "/admin";
        return;
      }

      window.location.href = "/dashboard";
    })();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-violet-light" />
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
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-white/60">Giriş tamamlanıyor…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
