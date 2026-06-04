import type { Metadata } from "next";
import "./globals.css";
import { ChunkLoadRecovery } from "@/components/chunk-load-recovery";
import { GoogleAnalytics } from "@/components/google-analytics";

export const metadata: Metadata = {
  title: "zippr.ink",
  description:
    "Dosya yükle, sıkıştır, dönüştür ve tek linkle paylaş. Ücretsiz dosya paylaşımı ve görsel araçları.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://zippr.ink"),
  verification: {
    google: "EAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U",
  },
  icons: {
    icon: "/zippr-ink-fav.svg",
    apple: "/zippr-ink-fav.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="EAHanvfqNDEdSb_VwOFHrnOnS9b8QwaFli57fTesy4U"
        />
        <GoogleAnalytics />
        <meta name="zippr-supabase-url" content={supabaseUrl} />
        <meta name="zippr-supabase-anon" content={supabaseAnon} />
        <meta name="zippr-app-url" content={appUrl} />
      </head>
      <body className="min-h-screen bg-black antialiased">
        <ChunkLoadRecovery />
        {children}
      </body>
    </html>
  );
}
