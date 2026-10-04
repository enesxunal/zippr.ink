import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PdfWorkspace } from "@/components/tools/pdf-workspace";
import { SEO_TOOL_LANDINGS } from "@/content/seo-tool-landings";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageSeo(locale, "pdf", "/tools/pdf");
}

export default async function PdfToolPage() {
  const [t, locale] = await Promise.all([getTranslations("tools"), getLocale()]);
  const relatedLandings = locale === "tr" ? SEO_TOOL_LANDINGS.filter((item) => item.mode === "pdf") : [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("pdfTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">{t("pdfSubtitle")}</p>
        </div>
        <PdfWorkspace />

        {relatedLandings.length > 0 && (
          <nav aria-label="İlgili PDF araçları" className="mx-auto mt-12 max-w-4xl">
            <h2 className="text-lg font-semibold">İlgili PDF araçları</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {relatedLandings.map((item) => (
                <Link
                  key={item.slug}
                  href={`/tools/${item.slug}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  {item.h1}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
