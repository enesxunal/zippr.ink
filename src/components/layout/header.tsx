"use client";

import { useTranslations, useLocale } from "next-intl";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Globe,
  Menu,
  X,
  ChevronDown,
  Upload,
  Zap,
  RefreshCw,
  FileText,
  Building2,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";

interface HeaderProps {
  user?: { email: string; role?: string } | null;
}

export function Header({ user }: HeaderProps) {
  const t = useTranslations("common");
  const tTools = useTranslations("tools");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toolLinks = [
    { href: "/tools/share", label: tTools("navShare"), icon: Upload },
    { href: "/tools/compress", label: tTools("navCompress"), icon: Zap },
    { href: "/tools/convert", label: tTools("navConvert"), icon: RefreshCw },
    { href: "/tools/pdf", label: tTools("navPdf"), icon: FileText },
  ];

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  const navLinkClass =
    "flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/5 hover:text-white";

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <ZipprLogo size="sm" priority linked />

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {toolLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={navLinkClass}>
              <Icon className="h-4 w-4 shrink-0 text-violet-light" strokeWidth={2.5} />
              <span>{label}</span>
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                navLinkClass,
                "font-normal text-white/60 hover:text-white/80"
              )}
            >
              <Tag className="h-4 w-4 text-white/50" strokeWidth={1.5} />
              <span className="font-normal">{t("pricing")}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[180px]">
              <DropdownMenuItem asChild>
                <Link href="/pricing" className="flex items-center gap-2 font-normal">
                  <Tag className="h-4 w-4 text-white/50" />
                  {t("pricing")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/enterprise" className="flex items-center gap-2 font-normal">
                  <Building2 className="h-4 w-4 text-white/50" />
                  {t("enterprise")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-9">
                <Globe className="h-4 w-4" />
                <span className="hidden lg:inline">{localeNames[locale]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((l) => (
                <DropdownMenuItem key={l} onClick={() => switchLocale(l)}>
                  {localeNames[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  {t("dashboard")}
                </Button>
              </Link>
              <LogoutButton variant="ghost" size="sm" showIcon={false} />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-normal">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-black px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {toolLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-white/90"
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4 text-violet-light" strokeWidth={2.5} />
                {label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="rounded-lg px-3 py-2 text-sm font-normal text-white/60"
              onClick={() => setMobileOpen(false)}
            >
              {t("pricing")}
            </Link>
            <Link
              href="/enterprise"
              className="rounded-lg px-3 py-2 text-sm font-normal text-white/60"
              onClick={() => setMobileOpen(false)}
            >
              {t("enterprise")}
            </Link>
            <div className="flex gap-2 border-t border-white/10 pt-4 mt-2">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    switchLocale(l);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "rounded px-2 py-1 text-xs",
                    l === locale ? "bg-violet text-white" : "text-white/60"
                  )}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            {user ? (
              <div className="mt-2 flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t("dashboard")}</Button>
                </Link>
                <LogoutButton className="w-full" />
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <Link href="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">{t("register")}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
