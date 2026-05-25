"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { routing } from "@/i18n/routing";

export default function AdminLoginPage() {
  const t = useTranslations("auth");
  const ta = useTranslations("admin");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("admin@zippr.ink");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const code = data.error as string;
        if (code === "invalid_credentials") setError(ta("loginInvalid"));
        else if (code === "not_authorized") setError(ta("notAuthorized"));
        else if (code === "auth_failed") setError(ta("supabaseConnectionError"));
        else setError(ta("loginInvalid"));
        setLoading(false);
        return;
      }

      const adminPath =
        locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`;
      window.location.href = adminPath;
    } catch {
      setError(ta("supabaseConnectionError"));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md border-violet/30">
        <CardHeader className="text-center">
          <ZipprLogo size="lg" className="mx-auto mb-4" linked />
          <CardTitle>{ta("loginTitle")}</CardTitle>
          <CardDescription className="text-white/50">{ta("loginSubtitle")}</CardDescription>
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
                placeholder="admin@zippr.ink"
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
              {loading ? tc("loading") : ta("loginButton")}
            </Button>
          </form>
          <p className="text-center text-xs text-white/40">
            <Link href="/" className="inline-flex hover:opacity-80">
              <ZipprLogo size="sm" />
            </Link>
            {" · "}
            <Link href="/login" className="hover:text-white/60">
              {ta("normalUserLogin")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
