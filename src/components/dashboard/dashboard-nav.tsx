"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: t("title") },
    { href: "/dashboard/api-keys", label: t("apiKeys") },
  ];

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-white/10 pb-4">
      {items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition",
            pathname === href || pathname?.endsWith(href)
              ? "bg-violet/20 text-violet-light"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
