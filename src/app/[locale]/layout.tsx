import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteJsonLd } from "@/components/seo/site-json-ld";
import { SITE_URL, normalizeLocale, pageSeo } from "@/lib/seo";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  return {
    ...pageSeo(locale, "home", ""),
    metadataBase: new URL(SITE_URL),
    verification: { google: "EAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U" },
    icons: {
      icon: "/zippr-ink-fav.svg",
      apple: "/zippr-ink-fav.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "de" | "en" | "tr")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <meta name="zippr-supabase-url" content={supabaseUrl} />
        <meta name="zippr-supabase-anon" content={supabaseAnon} />
        <meta name="zippr-app-url" content={appUrl} />
      </head>
      <body className="min-h-screen bg-black antialiased">
        <SiteJsonLd locale={locale} />
        <ChunkLoadRecovery />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <div className="flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
