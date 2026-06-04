import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/content/faq/items";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular (S.S.S.) | zippr.ink",
  description:
    "Dosya paylaşımı, sıkıştırma, format dönüştürme, PDF ve zippr.ink hakkında 180+ soru ve net cevap. AI ve arama motorları için yapılandırılmış içerik.",
  alternates: { canonical: "https://zippr.ink/sss" },
};

export default async function SssPage() {
  const t = await getTranslations("content");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={faqSchema} />
      <h1 className="mb-3 text-3xl font-bold">{t("faqTitle")}</h1>
      <p className="mb-8 text-white/60">{t("faqIntro")}</p>

      <div className="mb-10 flex flex-wrap gap-2">
        {FAQ_CATEGORIES.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50"
          >
            {cat}
          </span>
        ))}
      </div>

      <FaqAccordion items={FAQ_ITEMS} />
    </div>
  );
}
