"use client";

import { useState } from "react";
import { FileIcon, FileText } from "lucide-react";
import { isImageMime } from "@/lib/file-types";
import { cn } from "@/lib/utils";

interface RemoteFilePreviewProps {
  url: string;
  mimeType: string;
  name: string;
  size?: "md" | "lg";
}

export function RemoteFilePreview({ url, mimeType, name, size = "lg" }: RemoteFilePreviewProps) {
  const [failed, setFailed] = useState(false);
  const isImage = isImageMime(mimeType);
  const isPdf = mimeType === "application/pdf";

  const box = cn(
    "relative mx-auto w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40",
    size === "lg" ? "max-h-[28rem]" : "max-h-48"
  );

  if (isImage && !failed) {
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="mx-auto max-h-[28rem] w-full object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  if (isPdf && !failed) {
    return (
      <div className={cn(box, "min-h-[20rem]")}>
        <iframe
          src={`${url}#page=1&view=FitH`}
          title={name}
          className="h-[28rem] w-full border-0 bg-white"
          onError={() => setFailed(true)}
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white/90">
          PDF
        </span>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      {isPdf ? (
        <FileText className="h-12 w-12 shrink-0 text-red-400" />
      ) : (
        <FileIcon className="h-12 w-12 shrink-0 text-violet-light" />
      )}
    </div>
  );
}
