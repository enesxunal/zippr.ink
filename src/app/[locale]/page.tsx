import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Zap, RefreshCw, FileText, ArrowRight, Shield, Sparkles } from "lucide-react";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tTools = await getTranslations("tools");
  const tc = await getTranslations("common");

  const tools = [
    {
      href: "/tools/share",
      icon: Upload,
      title: t("featureUpload"),
      desc: t("featureUploadDesc"),
    },
    {
      href: "/tools/compress",
      icon: Zap,
      title: t("featureCompress"),
      desc: t("featureCompressDesc"),
    },
    {
      href: "/tools/convert",
      icon: RefreshCw,
      title: t("featureConvert"),
      desc: t("featureConvertDesc"),
    },
    {
      href: "/tools/pdf",
      icon: FileText,
      title: tTools("pdfTitle"),
      desc: tTools("pdfCardDesc"),
    },
  ];

  const perks = [
    { icon: Shield, text: t("perkSecure") },
    { icon: Sparkles, text: t("perkFast") },
    { icon: Zap, text: t("perkSimple") },
  ];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-violet/25 blur-[100px]" />

      {/* Hero */}
      <section className="relative border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="flex flex-col items-center text-center">
            <ZipprLogo size="hero" priority className="mb-8" linked />
            <h1 className="text-gradient mb-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mb-8 max-w-xl text-lg text-white/60">{t("heroSubtitle")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/register">
                <Button size="lg" className="min-w-[160px]">
                  {tc("getStarted")}
                </Button>
              </Link>
              <Link href="/tools/share">
                <Button size="lg" variant="secondary" className="min-w-[160px]">
                  {tTools("navShare")}
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-6 sm:gap-10">
              {perks.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/50">
                  <Icon className="h-4 w-4 text-violet-light" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{tTools("chooseTool")}</h2>
          <p className="mt-2 text-white/50">{t("toolsIntro")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {tools.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href}>
              <Card className="group h-full overflow-hidden border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent transition duration-300 hover:border-violet/50 hover:shadow-lg hover:shadow-violet/10">
                <CardContent className="flex h-full flex-col p-6 sm:p-8">
                  <div className="mb-5 inline-flex w-fit rounded-2xl bg-violet/20 p-3.5 ring-1 ring-violet/30 transition group-hover:scale-105 group-hover:bg-violet/30">
                    <Icon className="h-7 w-7 text-violet-light" strokeWidth={2.5} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-white/55">{desc}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-violet-light">
                    {tTools("openTool")}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-white/35">{tTools("comingSoon")}</p>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5 bg-violet/5">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">{t("ctaTitle")}</h2>
          <p className="mt-2 text-white/50">{t("ctaDesc")}</p>
          <Link href="/pricing" className="mt-6 inline-block">
            <Button variant="outline">{tc("pricing")}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
