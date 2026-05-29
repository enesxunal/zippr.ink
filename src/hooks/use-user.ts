"use client";

import { useEffect, useState } from "react";
import { tryCreateClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { id: data.user.id, email: data.user.email } : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isLoggedIn: !!user };
}
