import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ToolWorkspace, type ToolMode } from "@/components/tools/tool-workspace";
import { SEO_TOOL_LANDINGS } from "@/content/seo-tool-landings";

interface Props {
  mode: ToolMode;
  titleKey: string;
  subtitleKey: string;
}

export async function ToolPageShell({ mode, titleKey, subtitleKey }: Props) {
  const [t, locale] = await Promise.all([getTranslations("tools"), getLocale()]);
  const relatedLandings = locale === "tr" ? SEO_TOOL_LANDINGS.filter((item) => item.mode === mode) : [];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t(titleKey)}</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">{t(subtitleKey)}</p>
        </div>
        <ToolWorkspace mode={mode} />

        {relatedLandings.length > 0 && (
          <nav aria-label="İlgili araçlar" className="mx-auto mt-12 max-w-4xl">
            <h2 className="text-lg font-semibold">İlgili ücretsiz araçlar</h2>
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
