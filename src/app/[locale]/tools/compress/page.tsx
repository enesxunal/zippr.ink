import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageSeo(locale, "compress", "/tools/compress");
}

export default function CompressToolPage() {
  return <ToolPageShell mode="compress" titleKey="compressTitle" subtitleKey="compressSubtitle" />;
}
