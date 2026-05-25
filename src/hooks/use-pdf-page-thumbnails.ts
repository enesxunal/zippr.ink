"use client";

import { useEffect, useState } from "react";

const MAX_THUMB_PAGES = 24;
const THUMB_SCALE = 0.4;

export function usePdfPageThumbnails(file: File | null | undefined) {
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!file) {
      setThumbs([]);
      setPageCount(0);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const data = new Uint8Array(await file.arrayBuffer());
        const doc = await pdfjs.getDocument({ data }).promise;
        const total = doc.numPages;
        if (cancelled) return;

        setPageCount(total);
        const limit = Math.min(total, MAX_THUMB_PAGES);
        const urls: string[] = [];

        for (let pageNum = 1; pageNum <= limit; pageNum++) {
          const page = await doc.getPage(pageNum);
          const viewport = page.getViewport({ scale: THUMB_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          urls.push(canvas.toDataURL("image/jpeg", 0.72));
          if (cancelled) return;
        }

        setThumbs(urls);
      } catch {
        if (!cancelled) {
          setThumbs([]);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { thumbs, pageCount, loading, error };
}
