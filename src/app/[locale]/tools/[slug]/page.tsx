import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PdfWorkspace } from "@/components/tools/pdf-workspace";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { getSeoToolLanding, SEO_TOOL_LANDINGS } from "@/content/seo-tool-landings";
import { localizedUrl } from "@/lib/seo";

type Params = Promise<{ locale: string; slug: string }>;

export function generateStaticParams() {
  return SEO_TOOL_LANDINGS.map((item) => ({ locale: "tr", slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const landing = getSeoToolLanding(slug);
  if (locale !== "tr" || !landing) return { robots: { index: false, follow: false } };

  const canonical = localizedUrl("tr", `/tools/${landing.slug}`);
  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "zippr.ink",
      locale: "tr_TR",
      title: landing.title,
      description: landing.description,
    },
  };
}

export default async function SeoToolLandingPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (locale !== "tr") notFound();
  const landing = getSeoToolLanding(slug);
  if (!landing) notFound();

  const canonical = localizedUrl("tr", `/tools/${landing.slug}`);
  const modeRoot = landing.mode === "pdf" ? "/tools/pdf" : `/tools/${landing.mode}`;
  const relatedLandings = SEO_TOOL_LANDINGS.filter(
    (item) => item.mode === landing.mode && item.slug !== landing.slug
  ).slice(0, 8);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: landing.h1,
        url: canonical,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
        description: landing.description,
      },
      {
        "@type": "FAQPage",
        mainEntity: landing.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "zippr.ink", item: localizedUrl("tr", "") },
          { "@type": "ListItem", position: 2, name: "Araçlar", item: localizedUrl("tr", modeRoot) },
          { "@type": "ListItem", position: 3, name: landing.h1, item: canonical },
        ],
      },
    ],
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{landing.h1}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-white/60">{landing.intro}</p>
        </div>

        {landing.mode === "pdf" ? <PdfWorkspace /> : <ToolWorkspace mode={landing.mode} />}

        <section className="mx-auto mt-14 max-w-4xl space-y-10">
          <div>
            <h2 className="text-2xl font-semibold">{landing.h1} nasıl kullanılır?</h2>
            <p className="mt-3 leading-7 text-white/65">
              Dosyanızı yukarıdaki alana bırakın, uygun işlemi seçin ve sonucu indirin. zippr.ink aynı
              işlemden sonra dosyanız için paylaşım linki oluşturmanıza da yardımcı olur.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {landing.bullets.map((item) => (
                <li key={item} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white/75">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Sık sorulan sorular</h2>
            <div className="mt-5 space-y-4">
              {landing.faq.map((item) => (
                <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="mt-2 leading-7 text-white/65">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {relatedLandings.length > 0 && (
            <nav aria-label="Benzer araçlar">
              <h2 className="text-2xl font-semibold">Benzer ücretsiz araçlar</h2>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {relatedLandings.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tools/${item.slug}`}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-white/70 transition hover:border-white/20 hover:text-white"
                  >
                    {item.h1}
                  </Link>
                ))}
              </div>
            </nav>
          )}

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/tools/compress" className="text-white/70 underline-offset-4 hover:underline">Görsel sıkıştırma</Link>
            <Link href="/tools/convert" className="text-white/70 underline-offset-4 hover:underline">Format dönüştürme</Link>
            <Link href="/tools/share" className="text-white/70 underline-offset-4 hover:underline">Dosya paylaşma</Link>
            <Link href="/tools/pdf" className="text-white/70 underline-offset-4 hover:underline">PDF araçları</Link>
          </div>
        </section>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </main>
  );
}
