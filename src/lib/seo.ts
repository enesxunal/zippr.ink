import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://zippr.ink").replace(/\/$/, "");
export const SEO_LOCALES = ["tr", "en", "de"] as const;
export type SeoLocale = (typeof SEO_LOCALES)[number];

const OG_LOCALE: Record<SeoLocale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
};

export function normalizeLocale(locale: string): SeoLocale {
  return SEO_LOCALES.includes(locale as SeoLocale) ? (locale as SeoLocale) : "tr";
}

export function localizedPath(locale: SeoLocale, path = ""): string {
  const normalized = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return locale === "tr" ? normalized || "/" : `/${locale}${normalized}`;
}

export function localizedUrl(locale: SeoLocale, path = ""): string {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

export function languageAlternates(path = ""): Record<string, string> {
  return {
    tr: localizedUrl("tr", path),
    en: localizedUrl("en", path),
    de: localizedUrl("de", path),
    "x-default": localizedUrl("tr", path),
  };
}

export function createSeoMetadata(options: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const locale = normalizeLocale(options.locale);
  const path = options.path || "";
  const canonical = localizedUrl(locale, path);

  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical,
      languages: languageAlternates(path),
    },
    robots: options.noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: options.type || "website",
      url: canonical,
      siteName: "zippr.ink",
      locale: OG_LOCALE[locale],
      title: options.title,
      description: options.description,
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
      ...(options.modifiedTime ? { modifiedTime: options.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
    },
  };
}

export const PAGE_SEO = {
  home: {
    tr: ["Ücretsiz Dosya Paylaşımı, Görsel ve PDF Araçları | zippr.ink", "Dosya yükleyin, büyük dosyaları tek linkle paylaşın; JPG, PNG, WebP ve PDF dosyalarını hızlıca sıkıştırın ve dönüştürün."],
    en: ["Free File Sharing, Image & PDF Tools | zippr.ink", "Upload and share large files with one link. Compress and convert JPG, PNG, WebP and PDF files quickly with free online tools."],
    de: ["Kostenlose Dateiübertragung, Bild- & PDF-Tools | zippr.ink", "Große Dateien per Link teilen sowie JPG, PNG, WebP und PDF online komprimieren und konvertieren."],
  },
  share: {
    tr: ["Ücretsiz Büyük Dosya Paylaşımı – Link ile Gönder | zippr.ink", "Büyük dosyaları ücretsiz yükleyin ve tek linkle paylaşın. Hızlı, kolay ve güvenli online dosya gönderme aracı."],
    en: ["Free Large File Sharing – Send Files by Link | zippr.ink", "Upload large files for free and share them with one link. A fast, simple and secure online file sharing tool."],
    de: ["Große Dateien kostenlos teilen – Per Link senden | zippr.ink", "Große Dateien kostenlos hochladen und mit einem Link teilen. Schnell, einfach und sicher online Dateien senden."],
  },
  compress: {
    tr: ["Ücretsiz Görsel Sıkıştırma – JPG, PNG, WebP | zippr.ink", "JPG, PNG ve WebP görsellerini online ve ücretsiz sıkıştırın. Dosya boyutunu azaltın, görüntü kalitesini koruyun."],
    en: ["Free Image Compressor – Compress JPG, PNG & WebP | zippr.ink", "Compress JPG, PNG and WebP images online for free. Reduce image file size while preserving visual quality."],
    de: ["Bilder kostenlos komprimieren – JPG, PNG & WebP | zippr.ink", "JPG-, PNG- und WebP-Bilder kostenlos online komprimieren. Dateigröße reduzieren und Bildqualität erhalten."],
  },
  convert: {
    tr: ["Ücretsiz Görsel Dönüştürücü – JPG, PNG, WebP, AVIF | zippr.ink", "JPG, PNG, WebP ve AVIF görsellerini online dönüştürün. Hızlı ve ücretsiz görsel format dönüştürme aracı."],
    en: ["Free Image Converter – JPG, PNG, WebP, AVIF | zippr.ink", "Convert JPG, PNG, WebP and AVIF images online. Fast and free image format converter."],
    de: ["Kostenloser Bildkonverter – JPG, PNG, WebP, AVIF | zippr.ink", "JPG-, PNG-, WebP- und AVIF-Bilder kostenlos online konvertieren. Schneller Bildformat-Konverter."],
  },
  pdf: {
    tr: ["Ücretsiz PDF Araçları – Sıkıştır, Birleştir ve Düzenle | zippr.ink", "PDF dosyalarını online sıkıştırın, birleştirin ve düzenleyin. Hızlı ve ücretsiz PDF araçları."],
    en: ["Free PDF Tools – Compress, Merge & Edit PDFs | zippr.ink", "Compress, merge and edit PDF files online with fast and free PDF tools."],
    de: ["Kostenlose PDF-Tools – Komprimieren, Zusammenfügen & Bearbeiten | zippr.ink", "PDF-Dateien online komprimieren, zusammenfügen und bearbeiten – schnell und kostenlos."],
  },
  pricing: {
    tr: ["Fiyatlandırma ve Planlar | zippr.ink", "Ücretsiz, Lite, Standard, Professional ve Enterprise zippr.ink planlarını karşılaştırın."],
    en: ["Pricing & Plans | zippr.ink", "Compare zippr.ink Free, Lite, Standard, Professional and Enterprise plans."],
    de: ["Preise & Tarife | zippr.ink", "Vergleichen Sie die Free-, Lite-, Standard-, Professional- und Enterprise-Tarife von zippr.ink."],
  },
  enterprise: {
    tr: ["Kurumsal Dosya ve Görsel İşleme Çözümleri | zippr.ink", "Ekipler ve şirketler için yüksek depolama, API ve kurumsal dosya işleme çözümleri için teklif alın."],
    en: ["Enterprise File & Image Processing Solutions | zippr.ink", "Get a quote for high-storage, API and enterprise file processing solutions for teams and businesses."],
    de: ["Enterprise-Lösungen für Dateien & Bildverarbeitung | zippr.ink", "Individuelle Angebote für Speicher, API und Dateiverarbeitung für Teams und Unternehmen."],
  },
} as const;

export function pageSeo(localeInput: string, key: keyof typeof PAGE_SEO, path = ""): Metadata {
  const locale = normalizeLocale(localeInput);
  const [title, description] = PAGE_SEO[key][locale];
  return createSeoMetadata({ locale, path, title, description });
}
