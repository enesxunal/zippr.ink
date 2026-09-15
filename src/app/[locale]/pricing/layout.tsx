import type { Metadata } from "next";
import { pageSeo } from "@/lib/seo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageSeo(locale, "pricing", "/pricing");
}
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
