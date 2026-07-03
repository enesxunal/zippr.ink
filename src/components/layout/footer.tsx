import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { Upload, Zap, RefreshCw, FileText } from "lucide-react";

export async function Footer() {
  const t = await getTranslations("common");
  const tTools = await getTranslations("tools");
  const tf = await getTranslations("footer");

  const tools = [
    { href: "/tools/share", label: tTools("navShare"), icon: Upload },
    { href: "/tools/compress", label: tTools("navCompress"), icon: Zap },
    { href: "/tools/convert", label: tTools("navConvert"), icon: RefreshCw },
    { href: "/tools/pdf", label: tTools("navPdf"), icon: FileText },
  ];

  return (
    <footer className="border-t border-white/10 bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <ZipprLogo size="md" linked />
            <p className="mt-4 max-w-sm text-sm text-white/50">{tf("tagline")}</p>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {tTools("toolsMenu")}
            </p>
            <ul className="space-y-2">
              {tools.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-violet-light"
                  >
                    <Icon className="h-4 w-4 text-violet-light" strokeWidth={2.5} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
              {tf("company")}
            </p>
            <ul className="space-y-2 text-sm font-normal text-white/60">
              <li>
                <Link href="/api-docs" className="transition hover:text-white">
                  {tf("apiDocs")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="transition hover:text-white">
                  {tf("blog")}
                </Link>
              </li>
              <li>
                <Link href="/sss" className="transition hover:text-white">
                  {tf("faq")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition hover:text-white">
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="transition hover:text-white">
                  {t("enterprise")}
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-white">
                  {t("login")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-white">
                  {t("register")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/40">© {new Date().getFullYear()} zippr.ink — {tf("rights")}</p>
          <p className="text-xs text-white/30">{t("tagline")}</p>
        </div>
      </div>
    </footer>
  );
}
