"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import JSZip from "jszip";
import {
  Upload,
  ImageIcon,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Download,
  CloudUpload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  cn,
  formatBytes,
  getPublicFileUrl,
} from "@/lib/utils";
import { mapUploadError, createDefaultUploadSlug } from "@/lib/slug";
import { uploadFileBytes } from "@/lib/upload-storage";
import { getUploadAuthHeaders } from "@/lib/upload-auth";
import {
  COMPRESS_ACCEPT,
  SHARE_ACCEPT,
  IMAGE_ACCEPT,
} from "@/lib/file-types";
import {
  getFileCategory,
  canCompress,
  canConvert,
  getConvertTargets,
  type ImageOutputFormat,
} from "@/lib/file-capabilities";
import { LIMITS } from "@/lib/upload-limits";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { rememberUploadSlug } from "@/components/dashboard/claim-recent-upload";
import { LocalFilePreview } from "@/components/preview/local-file-preview";
import { FileListRow } from "@/components/preview/file-list-row";
import { PdfPageGrid } from "@/components/preview/pdf-page-grid";

export type ToolMode = "share" | "compress" | "convert";

type Step = "idle" | "configure" | "processing" | "result" | "uploading" | "done";

interface ToolWorkspaceProps {
  mode: ToolMode;
}

function validateBatch(
  files: File[],
  limits: (typeof LIMITS)["compress"],
  tPdf: (key: string, values?: Record<string, string | number>) => string
): string | null {
  if (files.length > limits.maxFiles) {
    return tPdf("tooManyFiles", { max: limits.maxFiles });
  }
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > limits.maxTotalBytes) return tPdf("batchTooLarge");
  for (const f of files) {
    if (f.size > limits.maxFileBytes) return tPdf("fileTooLarge");
  }
  return null;
}

export function ToolWorkspace({ mode }: ToolWorkspaceProps) {
  const t = useTranslations("common");
  const tTools = useTranslations("tools");
  const tPdf = useTranslations("pdf");
  const tErr = useTranslations("errors");
  const { isLoggedIn } = useUser();
  const router = useRouter();

  const [step, setStep] = useState<Step>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processedFiles, setProcessedFiles] = useState<File[]>([]);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [format, setFormat] = useState<ImageOutputFormat>("webp");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState<number | null>(null);
  const [slugWasAdjusted, setSlugWasAdjusted] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");
  const [donePreviewFile, setDonePreviewFile] = useState<File | null>(null);

  const isMulti = mode === "share" || mode === "compress";
  const activeFile = file || files[0] || null;
  const category = activeFile
    ? getFileCategory(activeFile.type, activeFile.name)
    : null;

  const acceptMap =
    mode === "share"
      ? SHARE_ACCEPT
      : mode === "compress"
        ? COMPRESS_ACCEPT
        : IMAGE_ACCEPT;

  const limits = mode === "share" ? LIMITS.share : LIMITS.compress;

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted.length) return;
      setError("");

      if (mode === "convert") {
        const f = accepted[0];
        setFile(f);
        setFiles([]);
        setCustomName(f.name);
        setCustomSlug(createDefaultUploadSlug());
        const cat = getFileCategory(f.type, f.name);
        const targets = getConvertTargets(cat);
        if (targets.length) setFormat(targets[0]);
        setStep("configure");
        return;
      }

      const batchErr = validateBatch(accepted, limits, tPdf);
      if (batchErr) {
        setError(batchErr);
        return;
      }

      if (mode === "compress") {
        const unsupported = accepted.filter((f) => !canCompress(getFileCategory(f.type, f.name)));
        if (unsupported.length) {
          setError(tTools("compressUnsupported"));
        }
        const ok = accepted.filter((f) => {
          const cat = getFileCategory(f.type, f.name);
          return cat === "image" || cat === "pdf";
        });
        if (!ok.length) return;
        setFiles(ok);
        setFile(null);
        setCustomName(ok.length === 1 ? ok[0].name : `${ok.length}-files`);
        setCustomSlug(createDefaultUploadSlug());
        void runCompress(ok);
        return;
      }

      setFiles(accepted);
      setFile(null);
      setCustomName(
        accepted.length === 1 ? accepted[0].name : `zippr-${accepted.length}-files`
      );
      setCustomSlug(createDefaultUploadSlug());
      setStep("configure");
    },
    [mode, limits, tPdf, tTools]
  );

  async function runCompress(batch: File[]) {
    setStep("processing");
    setError("");
    const results: File[] = [];
    let hadPdf = false;
    try {
      for (let i = 0; i < batch.length; i++) {
        setBatchProgress(`${i + 1}/${batch.length}`);
        const f = batch[i];
        const cat = getFileCategory(f.type, f.name);
        if (cat === "pdf") {
          hadPdf = true;
          results.push(f);
          continue;
        }
        results.push(await transformImage(f, "webp"));
      }
      setProcessedFiles(results);
      if (results.length === 1) {
        setProcessedFile(results[0]);
        const cat = getFileCategory(batch[0].type, batch[0].name);
        if (cat === "image") {
          setSavingsPercent(
            Math.round((1 - results[0].size / batch[0].size) * 100) || null
          );
        } else {
          setSavingsPercent(null);
        }
      }
      if (hadPdf && results.length === 1) {
        setError("");
      }
      setStep("result");
    } catch {
      setError(tErr("uploadFailed"));
      setStep("idle");
    } finally {
      setBatchProgress("");
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: isMulti,
    maxSize: limits.maxFileBytes,
    accept: acceptMap,
  });

  async function transformImage(input: File, targetFormat: ImageOutputFormat): Promise<File> {
    const bytes = new Uint8Array(await input.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    const res = await fetch("/api/transform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData: base64,
        format: targetFormat,
        quality: 82,
        compress: true,
      }),
    });

    if (!res.ok) throw new Error("transform failed");
    const data = await res.json();
    const outputBytes = Uint8Array.from(atob(data.data), (c) => c.charCodeAt(0));
    const ext = targetFormat === "jpeg" ? "jpg" : targetFormat;
    const newName = input.name.replace(/\.[^.]+$/, "") + "." + ext;
    return new File([outputBytes], newName, { type: data.mimeType });
  }

  async function handleProcess() {
    if (mode === "convert" && file) {
      const cat = getFileCategory(file.type, file.name);
      if (!canConvert(cat)) return;
      setStep("processing");
      setError("");
      try {
        const result = await transformImage(file, format);
        setProcessedFile(result);
        setCustomName(result.name);
        const savings = Math.round((1 - result.size / file.size) * 100);
        setSavingsPercent(savings > 0 ? savings : null);
        setStep("result");
      } catch {
        setError(tErr("uploadFailed"));
        setStep("configure");
      }
      return;
    }

  }

  async function buildShareFile(): Promise<File> {
    if (files.length === 1) return files[0];
    const zip = new JSZip();
    for (const f of files) zip.file(f.name, f);
    const blob = await zip.generateAsync({ type: "blob" });
    const name = `${customSlug || "files"}.zip`;
    return new File([blob], name, { type: "application/zip" });
  }

  async function downloadResultsZip() {
    const list = processedFiles.length ? processedFiles : processedFile ? [processedFile] : [];
    if (!list.length) return;
    if (list.length === 1) {
      const url = URL.createObjectURL(list[0]);
      const a = document.createElement("a");
      a.href = url;
      a.download = list[0].name;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    const zip = new JSZip();
    for (const f of list) zip.file(f.name, f);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed.zip";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleSaveAndLink() {
    let uploadFile: File | null = null;
    if (mode === "share") {
      uploadFile = await buildShareFile();
    } else {
      uploadFile = processedFile || processedFiles[0] || file;
      if (processedFiles.length > 1) {
        const zip = new JSZip();
        for (const f of processedFiles) zip.file(f.name, f);
        const blob = await zip.generateAsync({ type: "blob" });
        uploadFile = new File([blob], `${customSlug || "compressed"}.zip`, {
          type: "application/zip",
        });
      }
    }
    if (!uploadFile) return;
    setDonePreviewFile(uploadFile);
    const slugToUse = createDefaultUploadSlug();
    setCustomSlug(slugToUse);

    setStep("uploading");
    setError("");
    setProgress(10);

    try {
      if (isLoggedIn) {
        await createClient().auth.getUser();
      }
      const authHeaders = await getUploadAuthHeaders();
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          mimeType: uploadFile.type || "application/octet-stream",
          customSlug: slugToUse,
          customName: customName || uploadFile.name,
          useCustomSlug: false,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(mapUploadError(initData.error || "", tErr));

      if (initData.slug) setCustomSlug(initData.slug);
      setSlugWasAdjusted(Boolean(initData.slugAdjusted));
      setProgress(40);

      await uploadFileBytes(uploadFile, initData.fileId, initData.presignedUrl ?? null);
      setProgress(80);

      const completeRes = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({ fileId: initData.fileId }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok) {
        throw new Error(mapUploadError(completeData.error || "complete_failed", tErr));
      }

      const finalSlug = initData.slug || customSlug;
      setShareUrl(completeData.shareUrl || getPublicFileUrl(finalSlug));
      if (finalSlug) rememberUploadSlug(finalSlug);
      setStep("done");

      if (isLoggedIn && finalSlug) {
        try {
          await fetch("/api/files/claim", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            credentials: "include",
            body: JSON.stringify({ slugs: [finalSlug] }),
          });
        } catch {
          // non-blocking
        }
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(
        msg.includes("Failed to fetch") || msg === "r2_upload_failed"
          ? tErr("uploadCors")
          : mapUploadError(msg, tErr) || tErr("uploadFailed")
      );
      setStep(mode === "share" ? "configure" : "result");
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setFile(null);
    setFiles([]);
    setProcessedFile(null);
    setProcessedFiles([]);
    setStep("idle");
    setShareUrl("");
    setProgress(0);
    setError("");
    setSavingsPercent(null);
    setSlugWasAdjusted(false);
    setBatchProgress("");
    setDonePreviewFile(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (!next.length) setStep("idle");
      return next;
    });
  }

  if (step === "done") {
    return (
      <Card className="mx-auto max-w-xl border-violet/30">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-400" />
          {donePreviewFile && (
            <LocalFilePreview file={donePreviewFile} size="lg" className="w-full" />
          )}
          <h3 className="text-xl font-semibold">{t("uploadComplete")}</h3>
          <p className="text-white/60">{t("yourLink")}</p>
          {slugWasAdjusted && (
            <p className="text-sm text-amber-300/90">{tErr("slugAdjusted")}</p>
          )}
          {files.length > 1 && mode === "share" && (
            <p className="text-sm text-white/50">{tTools("shareZipHint", { count: files.length })}</p>
          )}
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
            <code className="flex-1 truncate text-sm text-violet-light">{shareUrl}</code>
            <Button size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4" />
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>
          {isLoggedIn && (
            <p className="text-sm text-white/50">{tTools("redirectDashboard")}</p>
          )}
          {!isLoggedIn && (
            <p className="text-sm text-white/50">
              {tTools("loginForDashboard")}{" "}
              <Link href="/login" className="text-violet-light underline">
                {t("login")}
              </Link>
            </p>
          )}
          <Button variant="ghost" onClick={reset}>
            {tTools("anotherFile")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if ((step === "result" || step === "uploading") && (processedFile || processedFiles.length)) {
    const display = processedFile || processedFiles[0]!;
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <LocalFilePreview file={display} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {processedFiles.length > 1
                    ? tTools("batchDone", { count: processedFiles.length })
                    : display.name}
                </p>
                <p className="text-sm text-white/50">
                  {processedFiles.length > 1
                    ? tTools("batchReady")
                    : formatBytes(display.size)}
                  {savingsPercent != null && savingsPercent > 0 && (
                    <span className="ml-2 text-green-400">−{savingsPercent}%</span>
                  )}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 shrink-0 text-green-400" />
            </div>
            {processedFiles.length === 1 &&
              getFileCategory(display.type, display.name) === "pdf" && (
                <PdfPageGrid file={display} />
              )}
          </div>

          <Button className="w-full gap-2" onClick={downloadResultsZip}>
            <Download className="h-4 w-4" />
            {processedFiles.length > 1 ? tTools("downloadZip") : t("download")}
          </Button>

          <Button className="w-full gap-2" onClick={handleSaveAndLink} disabled={step === "uploading"}>
            {step === "uploading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("processing")} {progress}%
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4" />
                {tTools("createLink")}
              </>
            )}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button variant="ghost" className="w-full" onClick={reset}>
            {tTools("anotherFile")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if ((step === "configure" || step === "processing" || step === "uploading") && (file || files.length)) {
    const convertTargets = file ? getConvertTargets(getFileCategory(file.type, file.name)) : [];
    const showConvert = mode === "convert" && convertTargets.length > 0;
    const isShareMode = mode === "share";

    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="space-y-5 p-6">
          {file && (
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <FileListRow
                file={file}
                meta={tTools(`type_${category}`)}
              />
              {category === "pdf" && <PdfPageGrid file={file} />}
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f, i) => {
                const cat = getFileCategory(f.type, f.name);
                const meta =
                  `${tTools(`type_${cat}`)}` +
                  (mode === "compress" && cat === "pdf"
                    ? ` · ${tTools("pdfCompressSoon")}`
                    : "");
                return (
                  <div key={`${f.name}-${i}`} className="space-y-2">
                    <FileListRow
                      file={f}
                      meta={meta}
                      onRemove={() => removeFile(i)}
                    />
                    {cat === "pdf" && files.length === 1 && i === 0 && (
                      <PdfPageGrid file={f} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === "processing" && file && getFileCategory(file.type, file.name) === "image" && (
            <LocalFilePreview file={file} size="lg" className="opacity-60" />
          )}

          {mode === "convert" && !showConvert && file && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-200/90">
              {category === "pdf" ? (
                <>
                  {tTools("convertPdfHint")}{" "}
                  <Link href="/tools/pdf" className="underline text-violet-light">
                    {tTools("navPdf")}
                  </Link>
                </>
              ) : (
                tTools("convertOfficeHint")
              )}
            </div>
          )}

          {showConvert && (
            <div className="space-y-2">
              <Label>{t("convert")}</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as ImageOutputFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {convertTargets.map((fmt) => (
                    <SelectItem key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isShareMode && files.length > 1 && (
            <p className="text-xs text-white/45">{tTools("shareZipHint", { count: files.length })}</p>
          )}
          {!isLoggedIn && isShareMode && (
            <p className="text-xs text-amber-300/90">
              {tTools("loginForDashboard")}{" "}
              <Link href="/login" className="underline text-violet-light">
                {t("login")}
              </Link>
            </p>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={reset} className="flex-1">
              {t("cancel")}
            </Button>
            <Button
              onClick={isShareMode ? handleSaveAndLink : handleProcess}
              className="flex-1 gap-2"
              disabled={step === "processing" || step === "uploading" || (mode === "convert" && !showConvert)}
            >
              {step === "processing" || step === "uploading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {batchProgress || t("processing")}
                </>
              ) : isShareMode ? (
                <>
                  <Upload className="h-4 w-4" />
                  {tTools("createLink")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t("convert")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dropLabel =
    mode === "compress"
      ? tTools("dropCompressAny")
      : mode === "convert"
        ? tTools("dropConvertAny")
        : tTools("dropShare");

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
        <div className="rounded-2xl bg-violet/20 p-4">
          {mode === "share" ? (
            <Upload className="h-10 w-10 text-violet-light" />
          ) : (
            <ImageIcon className="h-10 w-10 text-violet-light" />
          )}
        </div>
        <p className="text-lg font-medium text-white/90">{dropLabel}</p>
        <p className="text-sm text-white/50">{tTools(`desc_${mode}`)}</p>
      </div>
    </div>
  );
}
