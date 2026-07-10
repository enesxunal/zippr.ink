import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { LIMITS } from "@/lib/upload-limits";
import { compressPdfBuffer } from "@/lib/pdf-compress";

export const runtime = "nodejs";

type PdfAction = "merge" | "split" | "split_all" | "delete" | "reorder" | "compress";

function parsePageList(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(",").map((p) => p.trim());
  for (const part of parts) {
    if (!part) continue;
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= maxPage) pages.add(i - 1);
      }
    } else {
      const n = parseInt(part, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= maxPage) pages.add(n - 1);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

async function loadPdf(base64: string) {
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > LIMITS.pdf.maxFileBytes) {
    throw new Error("file_too_large");
  }
  return PDFDocument.load(bytes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, files, pageRange, pagesToDelete, pageOrder } = body as {
      action: PdfAction;
      files?: string[];
      pageRange?: string;
      pagesToDelete?: string;
      pageOrder?: number[];
    };

    if (!action) {
      return NextResponse.json({ error: "missing_action" }, { status: 400 });
    }

    if (action === "merge") {
      if (!files?.length || files.length < 2) {
        return NextResponse.json({ error: "need_two_pdfs" }, { status: 400 });
      }
      if (files.length > LIMITS.pdf.maxFiles) {
        return NextResponse.json({ error: "too_many_files" }, { status: 400 });
      }

      const merged = await PDFDocument.create();
      for (const b64 of files) {
        const doc = await loadPdf(b64);
        const copied = await merged.copyPages(doc, doc.getPageIndices());
        copied.forEach((p) => merged.addPage(p));
      }
      if (merged.getPageCount() > LIMITS.pdf.maxPages) {
        return NextResponse.json({ error: "too_many_pages" }, { status: 400 });
      }
      const out = await merged.save();
      return NextResponse.json({
        data: Buffer.from(out).toString("base64"),
        fileName: "merged.pdf",
        pageCount: merged.getPageCount(),
      });
    }

    if (!files?.[0]) {
      return NextResponse.json({ error: "missing_file" }, { status: 400 });
    }

    if (action === "compress") {
      const bytes = Buffer.from(files[0], "base64");
      if (bytes.length > LIMITS.pdf.maxFileBytes) {
        return NextResponse.json({ error: "file_too_large" }, { status: 400 });
      }
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      if (doc.getPageCount() > LIMITS.pdf.maxPages) {
        return NextResponse.json({ error: "too_many_pages" }, { status: 400 });
      }
      const { buffer, imagesTouched } = await compressPdfBuffer(new Uint8Array(bytes));
      return NextResponse.json({
        data: Buffer.from(buffer).toString("base64"),
        fileName: "compressed.pdf",
        pageCount: doc.getPageCount(),
        originalSize: bytes.length,
        size: buffer.length,
        imagesTouched,
        savings: Math.max(0, Math.round((1 - buffer.length / bytes.length) * 100)),
      });
    }

    const source = await loadPdf(files[0]);
    const pageCount = source.getPageCount();
    if (pageCount > LIMITS.pdf.maxPages) {
      return NextResponse.json({ error: "too_many_pages" }, { status: 400 });
    }

    if (action === "split") {
      const range = pageRange?.trim();
      const out = await PDFDocument.create();

      if (!range || range.toLowerCase() === "all") {
        const all = source.getPageIndices();
        const copied = await out.copyPages(source, all);
        copied.forEach((p) => out.addPage(p));
        const bytes = await out.save();
        return NextResponse.json({
          data: Buffer.from(bytes).toString("base64"),
          fileName: "split.pdf",
          pageCount: out.getPageCount(),
          splitAll: false,
        });
      }

      const indices = parsePageList(range, pageCount);
      if (!indices.length) {
        return NextResponse.json({ error: "invalid_range" }, { status: 400 });
      }
      const copied = await out.copyPages(source, indices);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      return NextResponse.json({
        data: Buffer.from(bytes).toString("base64"),
        fileName: "extract.pdf",
        pageCount: out.getPageCount(),
      });
    }

    if (action === "split_all") {
      const pages: { data: string; fileName: string }[] = [];
      for (let i = 0; i < pageCount; i++) {
        const single = await PDFDocument.create();
        const [copied] = await single.copyPages(source, [i]);
        single.addPage(copied);
        const bytes = await single.save();
        pages.push({
          data: Buffer.from(bytes).toString("base64"),
          fileName: `page-${i + 1}.pdf`,
        });
      }
      return NextResponse.json({ pages, pageCount });
    }

    if (action === "delete") {
      const toRemove = parsePageList(pagesToDelete || "", pageCount);
      if (!toRemove.length) {
        return NextResponse.json({ error: "invalid_pages" }, { status: 400 });
      }
      const removeSet = new Set(toRemove);
      const keep = source.getPageIndices().filter((i) => !removeSet.has(i));
      if (!keep.length) {
        return NextResponse.json({ error: "cannot_delete_all" }, { status: 400 });
      }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(source, keep);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      return NextResponse.json({
        data: Buffer.from(bytes).toString("base64"),
        fileName: "edited.pdf",
        pageCount: out.getPageCount(),
      });
    }

    if (action === "reorder") {
      if (!pageOrder?.length || pageOrder.length !== pageCount) {
        return NextResponse.json({ error: "invalid_order" }, { status: 400 });
      }
      const valid = pageOrder.every(
        (n) => Number.isInteger(n) && n >= 0 && n < pageCount
      );
      if (!valid || new Set(pageOrder).size !== pageCount) {
        return NextResponse.json({ error: "invalid_order" }, { status: 400 });
      }
      const out = await PDFDocument.create();
      const copied = await out.copyPages(source, pageOrder);
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      return NextResponse.json({
        data: Buffer.from(bytes).toString("base64"),
        fileName: "reordered.pdf",
        pageCount: out.getPageCount(),
      });
    }

    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    console.error("PDF API error:", error);
    const msg = error instanceof Error ? error.message : "pdf_failed";
    if (msg === "file_too_large") {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: "pdf_failed" }, { status: 500 });
  }
}
