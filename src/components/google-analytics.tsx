import Script from "next/script";

/** GA4 — build/deploy sırasında env yoksa varsayılan ID (zippr.ink mülkü) */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-8DNKL2V13M";

/** Google etiket doğrulaması için script ilk HTML'de <head> içinde yüklenir */
export function GoogleAnalytics() {
  const id = GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="beforeInteractive"
      />
      <Script id="google-analytics" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
