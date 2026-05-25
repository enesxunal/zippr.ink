"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import {
  FileText,
  Merge,
  Scissors,
  Trash2,
  ArrowUpDown,
  Loader2,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatBytes } from "@/lib/utils";
import { LIMITS } from "@/lib/upload-limits";
import { parsePageList } from "@/lib/pdf-pages";
import { FileListRow } from "@/components/preview/file-list-row";
import { PdfPageGrid } from "@/components/preview/pdf-page-grid";

type PdfAction = "merge" | "split" | "split_all" | "delete" | "reorder";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function downloadBase64Pdf(base64: string, fileName: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function PdfWorkspace() {
  const tc = useTranslations("common");
  const tPdf = useTranslations("pdf");
  const tErr = useTranslations("errors");

  const [action, setAction] = useState<PdfAction>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [pageRange, setPageRange] = useState("1-");
  const [pagesToDelete, setPagesToDelete] = useState("");
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsMultiple = action === "merge";

  const validatePdfFiles = useCallback(
    (incoming: File[]) => {
      const pdfs = incoming.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );
      if (!pdfs.length) {
        setError(tPdf("pdfOnly"));
        return [];
      }
      const max = needsMultiple ? LIMITS.pdf.maxFiles : 1;
      const list = needsMultiple ? pdfs : [pdfs[0]];
      if (list.length > max) {
        setError(tPdf("tooManyFiles", { max }));
        return [];
      }
      const total = list.reduce((s, f) => s + f.size, 0);
      if (total > LIMITS.pdf.maxTotalBytes) {
        setError(tPdf("batchTooLarge"));
        return [];
      }
      for (const f of list) {
        if (f.size > LIMITS.pdf.maxFileBytes) {
          setError(tPdf("fileTooLarge"));
          return [];
        }
      }
      return list;
    },
    [needsMultiple, tPdf]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError("");
      const valid = validatePdfFiles(accepted);
      if (!valid.length) return;
      if (needsMultiple) {
        setFiles((prev) => {
          const combined = [...prev, ...valid];
          if (combined.length > LIMITS.pdf.maxFiles) {
            setError(tPdf("tooManyFiles", { max: LIMITS.pdf.maxFiles }));
            return prev;
          }
          const total = combined.reduce((s, f) => s + f.size, 0);
          if (total > LIMITS.pdf.maxTotalBytes) {
            setError(tPdf("batchTooLarge"));
            return prev;
          }
          return combined;
        });
      } else {
        setFiles(valid);
        loadPageCount(valid[0]);
      }
    },
    [needsMultiple, validatePdfFiles, tPdf]
  );

  async function loadPageCount(file: File) {
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const count = doc.getPageCount();
      setPageCount(count);
      setPageOrder(Array.from({ length: count }, (_, i) => i));
      if (action === "split" && !pageRange.includes("-")) {
        setPageRange(`1-${count}`);
      }
    } catch {
      setPageCount(0);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: needsMultiple,
    maxSize: LIMITS.pdf.maxFileBytes,
    accept: { "application/pdf": [".pdf"] },
  });

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next[0] && !needsMultiple) loadPageCount(next[0]);
      else if (!next.length) {
        setPageCount(0);
        setPageOrder([]);
      }
      return next;
    });
  }

  function movePage(index: number, dir: -1 | 1) {
    setPageOrder((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function runPdfApi(payload: Record<string, unknown>) {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      const key = data.error as string;
      const map: Record<string, string> = {
        need_two_pdfs: tPdf("needTwo"),
        too_many_files: tPdf("tooManyFiles", { max: LIMITS.pdf.maxFiles }),
        file_too_large: tPdf("fileTooLarge"),
        too_many_pages: tPdf("tooManyPages"),
        invalid_range: tPdf("invalidRange"),
        invalid_pages: tPdf("invalidPages"),
        invalid_order: tPdf("invalidOrder"),
        cannot_delete_all: tPdf("cannotDeleteAll"),
      };
      throw new Error(map[key] || tErr("uploadFailed"));
    }
    return data;
  }

  async function handleProcess() {
    setError("");
    setLoading(true);
    try {
      if (action === "merge") {
        if (files.length < 2) {
          setError(tPdf("needTwo"));
          setLoading(false);
          return;
        }
        const encoded = await Promise.all(files.map(fileToBase64));
        const data = await runPdfApi({ action: "merge", files: encoded });
        downloadBase64Pdf(data.data, data.fileName);
      } else if (!files[0]) {
        setError(tPdf("uploadFirst"));
        setLoading(false);
        return;
      } else {
        const encoded = await fileToBase64(files[0]);
        if (action === "split") {
          const data = await runPdfApi({
            action: "split",
            files: [encoded],
            pageRange,
          });
          downloadBase64Pdf(data.data, data.fileName);
        } else if (action === "split_all") {
          const data = await runPdfApi({ action: "split_all", files: [encoded] });
          const zip = new JSZip();
          for (const p of data.pages as { data: string; fileName: string }[]) {
            zip.file(p.fileName, Uint8Array.from(atob(p.data), (c) => c.charCodeAt(0)));
          }
          const blob = await zip.generateAsync({ type: "blob" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "pages.zip";
          a.click();
          URL.revokeObjectURL(url);
        } else if (action === "delete") {
          const data = await runPdfApi({
            action: "delete",
            files: [encoded],
            pagesToDelete,
          });
          downloadBase64Pdf(data.data, data.fileName);
        } else if (action === "reorder") {
          const data = await runPdfApi({
            action: "reorder",
            files: [encoded],
            pageOrder,
          });
          downloadBase64Pdf(data.data, data.fileName);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : tErr("uploadFailed"));
    } finally {
      setLoading(false);
    }
  }

  const actions: { id: PdfAction; icon: typeof Merge; label: string; desc: string }[] = [
    { id: "merge", icon: Merge, label: tPdf("merge"), desc: tPdf("mergeDesc") },
    { id: "split", icon: Scissors, label: tPdf("split"), desc: tPdf("splitDesc") },
    { id: "split_all", icon: Scissors, label: tPdf("splitAll"), desc: tPdf("splitAllDesc") },
    { id: "delete", icon: Trash2, label: tPdf("deletePages"), desc: tPdf("deleteDesc") },
    { id: "reorder", icon: ArrowUpDown, label: tPdf("reorder"), desc: tPdf("reorderDesc") },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map(({ id, icon: Icon, label, desc }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setAction(id);
              setFiles([]);
              setError("");
              setPageCount(0);
            }}
            className={cn(
              "rounded-xl border p-4 text-left transition",
              action === id
                ? "border-violet bg-violet/15"
                : "border-white/10 bg-white/[0.02] hover:border-violet/40"
            )}
          >
            <Icon className="mb-2 h-5 w-5 text-violet-light" />
            <p className="font-semibold text-white">{label}</p>
            <p className="mt-1 text-xs text-white/50">{desc}</p>
          </button>
        ))}
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition",
          isDragActive ? "border-violet bg-violet/10" : "border-white/20 hover:border-violet/40"
        )}
      >
        <input {...getInputProps()} />
        <FileText className="mx-auto mb-3 h-10 w-10 text-violet-light" />
        <p className="font-medium">{needsMultiple ? tPdf("dropMany") : tPdf("dropOne")}</p>
        <p className="mt-1 text-xs text-white/45">
          {tPdf("limits", { max: LIMITS.pdf.maxFiles, mb: 50 })}
        </p>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="space-y-4 p-4">
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className="space-y-3">
                <FileListRow file={f} onRemove={() => removeFile(i)} />
              </div>
            ))}
            {!needsMultiple && files[0] && (
              <PdfPageGrid
                file={files[0]}
                highlightPages={
                  action === "delete" && pagesToDelete
                    ? parsePageList(pagesToDelete, pageCount || 999)
                    : []
                }
                orderLabels={
                  action === "reorder" && pageCount > 0
                    ? pageOrder.map((pageIdx, position) => ({
                        position: position + 1,
                        page: pageIdx + 1,
                      }))
                    : undefined
                }
              />
            )}
          </CardContent>
        </Card>
      )}

      {action === "split" && files[0] && (
        <div className="space-y-2">
          <Label>{tPdf("pageRange")}</Label>
          <Input
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="1-3, 5"
          />
          <p className="text-xs text-white/45">{tPdf("pageRangeHint")}</p>
        </div>
      )}

      {action === "delete" && files[0] && (
        <div className="space-y-2">
          <Label>{tPdf("pagesToDelete")}</Label>
          <Input
            value={pagesToDelete}
            onChange={(e) => setPagesToDelete(e.target.value)}
            placeholder="2, 4-6"
          />
          <p className="text-xs text-white/45">
            {tPdf("totalPages", { count: pageCount })}
          </p>
        </div>
      )}

      {action === "reorder" && pageCount > 0 && (
        <div className="space-y-2">
          <Label>{tPdf("pageOrder")}</Label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-white/10 p-2">
            {pageOrder.map((pageIdx, displayIdx) => (
              <div
                key={displayIdx}
                className="flex items-center justify-between rounded bg-white/5 px-2 py-1.5 text-sm"
              >
                <span>
                  {tPdf("position")} {displayIdx + 1} → {tPdf("page")} {pageIdx + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={displayIdx === 0}
                    onClick={() => movePage(displayIdx, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={displayIdx === pageCount - 1}
                    onClick={() => movePage(displayIdx, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button
        className="w-full gap-2"
        disabled={loading || (action === "merge" ? files.length < 2 : !files[0])}
        onClick={handleProcess}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {tc("processing")}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {tPdf("downloadResult")}
          </>
        )}
      </Button>
    </div>
  );
}
