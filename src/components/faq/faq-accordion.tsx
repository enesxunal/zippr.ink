"use client";

import { useMemo, useState } from "react";
import type { FaqItem } from "@/content/faq/items";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="space-y-6">
      <input
        type="search"
        placeholder="Soru veya anahtar kelime ara…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:border-violet/50"
      />
      <p className="text-sm text-white/50">
        {filtered.length} soru listeleniyor
      </p>
      <div className="space-y-2">
        {filtered.map((item, idx) => {
          const id = `${idx}-${item.q.slice(0, 24)}`;
          const open = openId === id;
          return (
            <div
              key={id}
              className="rounded-xl border border-white/10 bg-white/[0.03]"
            >
              <button
                type="button"
                className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                onClick={() => setOpenId(open ? null : id)}
                aria-expanded={open}
              >
                <span className="font-medium text-white/90">{item.q}</span>
                <span className="shrink-0 text-violet-light">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="border-t border-white/10 px-4 py-3 text-sm leading-relaxed text-white/65">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
