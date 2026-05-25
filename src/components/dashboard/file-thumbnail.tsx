"use client";

import { useState } from "react";
import { FileIcon, FileText, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PreviewKind } from "@/lib/file-preview";

interface FileThumbnailProps {
  name: string;
  previewUrl: string | null;
  kind: PreviewKind;
  className?: string;
}

export function FileThumbnail({ name, previewUrl, kind, className }: FileThumbnailProps) {
  const [failed, setFailed] = useState(false);

  const box = cn(
    "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/5",
    className
  );

  if (kind === "image" && previewUrl && !failed) {
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  if (kind === "pdf" && previewUrl && !failed) {
    return (
      <div className={cn(box, "bg-red-500/10")}>
        <iframe
          src={`${previewUrl}#page=1&zoom=50`}
          title={name}
          className="pointer-events-none h-[200%] w-[200%] origin-top-left scale-50"
          onError={() => setFailed(true)}
        />
        <div className="absolute bottom-0 right-0 rounded-tl bg-black/60 px-1 text-[9px] text-white/80">
          PDF
        </div>
      </div>
    );
  }

  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : FileIcon;
  const iconClass =
    kind === "pdf"
      ? "text-red-400"
      : kind === "image"
        ? "text-violet-light"
        : "text-white/40";

  return (
    <div className={box}>
      <Icon className={cn("h-7 w-7", iconClass)} />
    </div>
  );
}
