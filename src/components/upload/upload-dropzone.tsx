"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import {
  Upload,
  ImageIcon,
  FileArchive,
  CheckCircle2,
  Copy,
  Loader2,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ZipprMark } from "@/components/brand/zippr-logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatBytes, isImageFile, slugify, isValidSlug } from "@/lib/utils";
import { mapUploadError, createDefaultUploadSlug } from "@/lib/slug";
import { uploadFileBytes } from "@/lib/upload-storage";
import { createClient } from "@/lib/supabase/client";
import { getUploadAuthHeaders } from "@/lib/upload-auth";
import { rememberUploadSlug } from "@/lib/pending-upload-slugs";
import type { ImageFormat } from "@/types/database";

type Step = "idle" | "configure" | "uploading" | "done";

export function UploadDropzone() {
  const t = useTranslations("common");
  const tErr = useTranslations("errors");
  const tLand = useTranslations("landing");

  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [compress, setCompress] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  const isImage = file ? isImageFile(file.type, file.name) : false;

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setCustomName(f.name);
    setCustomSlug(createDefaultUploadSlug());
    setStep("configure");
    setError("");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5 * 1024 * 1024 * 1024,
  });

  async function handleUpload() {
    if (!file) return;
    setStep("uploading");
    setError("");
    setProgress(10);

    try {
      let uploadFile = file;
      let mimeType = file.type;
      let fileSize = file.size;

      if (isImage && (compress || format !== "webp")) {
        setProgress(25);
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const transformRes = await fetch("/api/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64,
            format,
            quality: 82,
            compress,
          }),
        });

        if (!transformRes.ok) throw new Error("transform failed");
        const transformed = await transformRes.json();
        const outputBytes = Uint8Array.from(atob(transformed.data), (c) => c.charCodeAt(0));
        const ext = format === "jpeg" ? "jpg" : format;
        const newName = customName.replace(/\.[^.]+$/, "") + "." + ext;
        uploadFile = new File([outputBytes], newName, { type: transformed.mimeType });
        mimeType = transformed.mimeType;
        fileSize = transformed.size;
      }

      setProgress(40);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const authHeaders = await getUploadAuthHeaders();
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({
          fileName: uploadFile.name,
          fileSize,
          mimeType: mimeType || "application/octet-stream",
          customSlug,
          customName: customName || uploadFile.name,
          useCustomSlug: false,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        throw new Error(mapUploadError(initData.error || "", tErr));
      }
      if (initData.slug) setCustomSlug(initData.slug);

      setProgress(55);

      await uploadFileBytes(uploadFile, initData.fileId, initData.presignedUrl ?? null);

      setProgress(80);

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({ fileId: initData.fileId }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok) throw new Error(completeData.error || tErr("uploadFailed"));

      setProgress(100);
      setShareUrl(completeData.shareUrl);
      if (completeData.slug || initData.slug) {
        rememberUploadSlug(completeData.slug || initData.slug);
      }
      if (user && (completeData.slug || initData.slug)) {
        try {
          await fetch("/api/files/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            credentials: "include",
            body: JSON.stringify({ slugs: [completeData.slug || initData.slug] }),
          });
        } catch {
          // non-blocking
        }
      }
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : tErr("uploadFailed"));
      setStep("configure");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setFile(null);
    setStep("idle");
    setShareUrl("");
    setProgress(0);
    setError("");
  }

  if (step === "done") {
    return (
      <Card className="mx-auto max-w-xl border-violet/30">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-400" />
          <h3 className="text-xl font-semibold">{t("uploadComplete")}</h3>
          <p className="text-white/60">{t("yourLink")}</p>
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
            <code className="flex-1 truncate text-sm text-violet-light">{shareUrl}</code>
            <Button size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>
          <Button variant="secondary" onClick={reset}>
            {t("upload")} +
          </Button>
        </CardContent>
      </Card>
    );
  }

  if ((step === "configure" || step === "uploading") && file) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
            {isImage ? (
              <ImageIcon className="h-10 w-10 text-violet-light" />
            ) : (
              <FileArchive className="h-10 w-10 text-violet-light" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{file.name}</p>
              <p className="text-sm text-white/50">{formatBytes(file.size)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customName">{t("fileName")}</Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSlug">{t("customLink")}</Label>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-white/40">
                <ZipprMark />
                <span>/</span>
              </span>
              <Input
                id="customSlug"
                value={customSlug}
                onChange={(e) => setCustomSlug(slugify(e.target.value))}
                placeholder="3kareajans"
              />
            </div>
            <p className="text-xs text-white/40">{t("customLinkHint")}</p>
          </div>

          {isImage && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("convert")}</Label>
                <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant={compress ? "default" : "secondary"}
                  className="w-full gap-2"
                  onClick={() => setCompress(!compress)}
                >
                  <Zap className="h-4 w-4" />
                  {t("compress")}
                </Button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={reset} className="flex-1">
              {t("cancel")}
            </Button>
            <Button onClick={handleUpload} className="flex-1 gap-2" disabled={step === "uploading"}>
              {step === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("processing")} {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {t("upload")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative mx-auto max-w-2xl cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300",
        isDragActive
          ? "border-violet bg-violet/10 scale-[1.02]"
          : "border-white/20 bg-white/[0.02] hover:border-violet/50 hover:bg-violet/5"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
        <div className="rounded-2xl bg-violet/20 p-4 transition group-hover:scale-110">
          <Upload className="h-10 w-10 text-violet-light" />
        </div>
        <p className="text-lg font-medium text-white/90">{t("dropzone")}</p>
        <p className="text-sm text-white/50">{tLand("heroSubtitle")}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
            <Upload className="h-3 w-3" /> {t("upload")}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
            <Zap className="h-3 w-3" /> {t("compress")}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
            <RefreshCw className="h-3 w-3" /> {t("convert")}
          </span>
        </div>
      </div>
    </div>
  );
}
