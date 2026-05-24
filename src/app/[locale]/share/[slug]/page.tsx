import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { formatBytes, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileIcon, Clock } from "lucide-react";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { Link } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SharePage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations("download");

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("files")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (!file) {
    notFound();
  }

  if (file.expires_at && new Date(file.expires_at) < new Date()) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="p-8">
            <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-400" />
            <h1 className="text-xl font-semibold">{t("fileExpired")}</h1>
            <Link href="/" className="mt-4 inline-block text-sm text-violet-light hover:underline">
              zippr.ink
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    const admin = createServiceClient();
    await admin
      .from("files")
      .update({ click_count: file.click_count + 1 })
      .eq("id", file.id);
  } catch {
    // non-blocking
  }

  let downloadHref = `/api/download/${slug}`;

  try {
    if (file.r2_key && process.env.CLOUDFLARE_R2_ACCOUNT_ID) {
      downloadHref = await getPresignedDownloadUrl(file.r2_key, 3600);
    }
  } catch {
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <Card className="relative w-full max-w-lg border-violet/20">
        <CardContent className="p-8 text-center">
          <ZipprLogo className="mb-6 text-3xl" />
          <p className="mb-6 text-sm text-white/50">{t("sharedBy")}</p>

          <div className="mb-6 flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <FileIcon className="h-12 w-12 shrink-0 text-violet-light" />
            <div className="min-w-0 text-left">
              <h1 className="truncate text-lg font-semibold">{file.custom_name}</h1>
              <p className="text-sm text-white/50">{formatBytes(file.file_size)}</p>
              {file.expires_at && (
                <p className="mt-1 text-xs text-white/40">
                  {formatDate(file.expires_at, locale)}
                </p>
              )}
            </div>
          </div>

          <a href={downloadHref} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full gap-2">
              <Download className="h-5 w-5" />
              {t("downloadNow")}
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
