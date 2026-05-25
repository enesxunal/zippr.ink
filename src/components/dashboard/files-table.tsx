import { getTranslations } from "next-intl/server";
import { formatBytes, formatDate, getPublicFileUrl } from "@/lib/utils";
import { getFilePreviewUrl } from "@/lib/file-preview";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileActions } from "@/components/dashboard/file-actions";
import { FileThumbnail } from "@/components/dashboard/file-thumbnail";
import type { FileRecord } from "@/types/database";

interface FilesTableProps {
  files: FileRecord[];
}

export async function FilesTable({ files }: FilesTableProps) {
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const previews = await Promise.all(
    files.map(async (file) => {
      const { url, kind } = await getFilePreviewUrl(file.r2_key, file.mime_type);
      return { fileId: file.id, url, kind };
    })
  );
  const previewById = Object.fromEntries(previews.map((p) => [p.fileId, p]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[72px]">{t("preview")}</TableHead>
          <TableHead>{tc("fileName")}</TableHead>
          <TableHead>Link</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>{t("clicks")}</TableHead>
          <TableHead>{t("downloads")}</TableHead>
          <TableHead>{tc("status")}</TableHead>
          <TableHead>{tc("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {files.map((file) => {
          const preview = previewById[file.id];
          return (
            <TableRow key={file.id}>
              <TableCell>
                <FileThumbnail
                  name={file.custom_name}
                  previewUrl={preview?.url ?? null}
                  kind={preview?.kind ?? "none"}
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{file.custom_name}</p>
                  <p className="text-xs text-white/40">{file.original_name}</p>
                </div>
              </TableCell>
              <TableCell>
                <a
                  href={getPublicFileUrl(file.slug)}
                  className="text-violet-light hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  /{file.slug}
                </a>
              </TableCell>
              <TableCell>{formatBytes(file.file_size)}</TableCell>
              <TableCell>{file.click_count}</TableCell>
              <TableCell>{file.download_count}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    file.status === "active"
                      ? "success"
                      : file.status === "expired"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {tc(file.status as "active" | "expired" | "deleted")}
                </Badge>
                {file.expires_at && (
                  <p className="mt-1 text-xs text-white/40">{formatDate(file.expires_at)}</p>
                )}
              </TableCell>
              <TableCell>
                <FileActions slug={file.slug} shareUrl={getPublicFileUrl(file.slug)} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
