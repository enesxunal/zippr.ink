/** Parse "1-3, 5, 7-9" into 1-based page numbers. */
export function parsePageList(input: string, maxPage: number): number[] {
  const pages = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [a, b] = part.split("-").map((s) => parseInt(s.trim(), 10));
      const start = Number.isFinite(a) ? a : 1;
      const end = Number.isFinite(b) ? b : maxPage;
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        if (i >= 1 && i <= maxPage) pages.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (Number.isFinite(n) && n >= 1 && n <= maxPage) pages.add(n);
    }
  }

  return [...pages].sort((a, b) => a - b);
}
