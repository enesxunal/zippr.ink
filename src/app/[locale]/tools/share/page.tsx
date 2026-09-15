import type { Metadata } from "next";
import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { pageSeo } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageSeo(locale, "share", "/tools/share");
}

export default function ShareToolPage() {
  return <ToolPageShell mode="share" titleKey="shareTitle" subtitleKey="shareSubtitle" />;
}
