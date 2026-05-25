"use client";

import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { usePdfPageThumbnails } from "@/hooks/use-pdf-page-thumbnails";
import { cn } from "@/lib/utils";

interface PdfPageGridProps {
  file: File;
  /** Highlight page numbers (1-based) e.g. selected for delete */
  highlightPages?: number[];
  /** Show order position instead of page number (for reorder UI) */
  orderLabels?: { position: number; page: number }[];
  className?: string;
}

export function PdfPageGrid({
  file,
  highlightPages = [],
  orderLabels,
  className,
}: PdfPageGridProps) {
  const tPdf = useTranslations("pdf");
  const { thumbs, pageCount, loading, error } = usePdfPageThumbnails(file);

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 py-8 text-white/50", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-violet-light" />
        <span className="text-sm">{tPdf("loadingPages")}</span>
      </div>
    );
  }

  if (error || !thumbs.length) {
    return (
      <p className={cn("text-center text-sm text-white/45", className)}>
        {tPdf("pagePreviewUnavailable")}
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs text-white/45">
        {tPdf("totalPages", { count: pageCount })}
        {pageCount > thumbs.length &&
          ` · ${tPdf("previewLimited", { shown: thumbs.length })}`}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {thumbs.map((src, index) => {
          const pageNum = index + 1;
          const highlighted = highlightPages.includes(pageNum);
          const order = orderLabels?.[index];

          return (
            <div
              key={pageNum}
              className={cn(
                "overflow-hidden rounded-lg border bg-white/5",
                highlighted
                  ? "border-red-400/60 ring-1 ring-red-400/40"
                  : "border-white/10"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Page ${pageNum}`} className="aspect-[3/4] w-full object-cover" />
              <p className="truncate px-1 py-0.5 text-center text-[10px] text-white/60">
                {order
                  ? `${order.position} → ${tPdf("page")} ${order.page}`
                  : `${tPdf("page")} ${pageNum}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
