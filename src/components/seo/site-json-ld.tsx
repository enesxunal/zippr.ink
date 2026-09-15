import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL, normalizeLocale } from "@/lib/seo";

export function SiteJsonLd({ locale }: { locale: string }) {
  const lang = normalizeLocale(locale);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "zippr.ink",
    url: SITE_URL,
    logo: `${SITE_URL}/zippr-ink-logo-b.svg`,
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: "zippr.ink",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: lang,
  };
  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  );
}
