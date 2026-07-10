import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getFilePreviewUrl } from "@/lib/file-preview";
import { formatBytes, formatDate } from "@/lib/utils";
import { isImageFile, isPdfFile } from "@/lib/file-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Clock } from "lucide-react";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { Link } from "@/i18n/routing";
import { RemoteFilePreview } from "@/components/preview/remote-file-preview";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SharePage({ params }: Props) {
  const { slug, locale } = await params;
  const t = await getTranslations("download");

  const admin = createServiceClient();
  const { data: file } = await admin
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
            <Link href="/" className="mt-4 inline-block">
              <ZipprLogo size="md" />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    await admin
      .from("files")
      .update({ click_count: file.click_count + 1 })
      .eq("id", file.id);
  } catch {
    // non-blocking
  }

  const { url: previewUrl } = await getFilePreviewUrl(file.r2_key, file.mime_type);
  const downloadHref = previewUrl || `/api/download/${slug}`;
  const hasPreview =
    previewUrl && (isImageFile(file.mime_type, file.original_name) || isPdfFile(file.mime_type, file.original_name));

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-30" />
      <Card className="relative w-full max-w-2xl border-violet/20">
        <CardContent className="p-8 text-center">
          <ZipprLogo size="lg" className="mx-auto mb-6" linked />
          <p className="mb-6 text-sm text-white/50">{t("sharedBy")}</p>

          {hasPreview && previewUrl ? (
            <RemoteFilePreview
              url={previewUrl}
              mimeType={file.mime_type}
              name={file.custom_name}
            />
          ) : null}

          <div className="mb-6 text-left">
            <h1 className="truncate text-lg font-semibold">{file.custom_name}</h1>
            <p className="text-sm text-white/50">{formatBytes(file.file_size)}</p>
            {file.expires_at && (
              <p className="mt-1 text-xs text-white/40">{formatDate(file.expires_at, locale)}</p>
            )}
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
