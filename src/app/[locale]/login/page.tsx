"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { routing } from "@/i18n/routing";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const dashboardPath =
      locale === routing.defaultLocale ? "/dashboard" : `/${locale}/dashboard`;
    const adminPath =
      locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;
    if (data.user?.email?.trim().toLowerCase() === "admin@zippr.ink") {
      window.location.href = adminPath;
    } else if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single<{ role: "user" | "super_admin" }>();
      window.location.href =
        profile?.role === "super_admin" ? adminPath : dashboardPath;
    } else {
      window.location.href = dashboardPath;
    }
    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getAuthCallbackUrl(window.location.origin, locale) },
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ZipprLogo size="lg" className="mx-auto mb-4" linked />
          <CardTitle>{t("signIn")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? tc("loading") : t("signIn")}
            </Button>
          </form>
          <Button variant="secondary" className="w-full" onClick={handleGoogle}>
            {t("signInWithGoogle")}
          </Button>
          <p className="text-center text-sm text-white/50">
            {t("noAccount")}{" "}
            <Link href="/register" className="text-violet-light hover:underline">
              {t("signUp")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
