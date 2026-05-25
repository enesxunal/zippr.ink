import { getTranslations } from "next-intl/server";
import { PdfWorkspace } from "@/components/tools/pdf-workspace";

export default async function PdfToolPage() {
  const t = await getTranslations("tools");

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("pdfTitle")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-white/60">{t("pdfSubtitle")}</p>
        </div>
        <PdfWorkspace />
      </div>
    </div>
  );
}
