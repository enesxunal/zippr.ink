import { getTranslations } from "next-intl/server";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { Upload, Zap, RefreshCw, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");

  const features = [
    { icon: Upload, title: t("featureUpload"), desc: t("featureUploadDesc") },
    { icon: Zap, title: t("featureCompress"), desc: t("featureCompressDesc") },
    { icon: RefreshCw, title: t("featureConvert"), desc: t("featureConvertDesc") },
    { icon: Share2, title: t("featureShare"), desc: t("featureShareDesc") },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet/20 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <ZipprLogo className="mb-6 text-5xl sm:text-7xl md:text-8xl" />
          <h2 className="text-gradient mb-4 text-2xl font-semibold sm:text-3xl">
            {t("heroTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-white/60">{t("heroSubtitle")}</p>
        </div>

        <UploadDropzone />

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="border-white/5 bg-white/[0.02] transition hover:border-violet/30">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex rounded-xl bg-violet/20 p-3">
                  <Icon className="h-6 w-6 text-violet-light" />
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-white/50">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-16 text-center text-sm text-white/30">{tc("tagline")}</p>
      </div>
    </div>
  );
}
