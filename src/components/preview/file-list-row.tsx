"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { LocalFilePreview } from "@/components/preview/local-file-preview";
import { formatBytes } from "@/lib/utils";

interface FileListRowProps {
  file: File;
  meta?: string;
  onRemove?: () => void;
}

export function FileListRow({ file, meta, onRemove }: FileListRowProps) {
  const t = useTranslations("common");

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
      <LocalFilePreview file={file} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-white/45">
          {formatBytes(file.size)}
          {meta ? ` · ${meta}` : ""}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-white/40 hover:text-white"
          aria-label={t("remove")}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
