"use client";

import { FileIcon, FileText, ImageIcon, Loader2 } from "lucide-react";
import { useObjectUrl } from "@/hooks/use-object-url";
import { getPreviewKind } from "@/lib/file-preview";
import { cn } from "@/lib/utils";

interface LocalFilePreviewProps {
  file: File;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-40 w-full max-h-64",
};

export function LocalFilePreview({ file, size = "md", className }: LocalFilePreviewProps) {
  const url = useObjectUrl(file);
  const kind = getPreviewKind(file.type || "", file.name);
  const box = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30",
    sizeMap[size],
    size === "lg" && "aspect-video w-full max-w-full",
    className
  );

  if (kind === "image" && url) {
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={file.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  if (kind === "pdf" && url) {
    return (
      <div className={cn(box, "bg-red-950/40")}>
        <iframe
          src={`${url}#page=1&view=FitH`}
          title={file.name}
          className={cn(
            "pointer-events-none border-0 bg-white",
            size === "lg"
              ? "h-full w-full"
              : "h-[220%] w-[220%] origin-top-left scale-[0.45]"
          )}
        />
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/70 px-1 text-[9px] text-white/90">
          PDF
        </span>
      </div>
    );
  }

  const Icon = kind === "pdf" ? FileText : kind === "image" ? ImageIcon : FileIcon;
  return (
    <div className={box}>
      <Icon
        className={cn(
          size === "lg" ? "h-12 w-12" : "h-7 w-7",
          kind === "pdf" ? "text-red-400" : "text-violet-light"
        )}
      />
    </div>
  );
}

export function PreviewLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-20 w-20 items-center justify-center rounded-lg border border-white/10 bg-white/5",
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-violet-light" />
    </div>
  );
}
