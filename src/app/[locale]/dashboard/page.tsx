import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { formatBytes, formatDate, getPublicFileUrl } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileActions } from "@/components/dashboard/file-actions";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "deleted")
    .order("created_at", { ascending: false });

  const storageUsed = Number(profile?.storage_used || 0);
  const storageLimit = Number(profile?.storage_limit || 5368709120);
  const storagePercent = Math.min(100, (storageUsed / storageLimit) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Link href="/pricing">
          <Button variant="outline">{t("upgradePlan")}</Button>
        </Link>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("storage")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex justify-between text-sm">
              <span>{formatBytes(storageUsed)}</span>
              <span className="text-white/50">{formatBytes(storageLimit)}</span>
            </div>
            <Progress value={storagePercent} className="h-3" />
            <p className="mt-2 text-xs text-white/40 capitalize">
              Plan: {profile?.plan_type || "free"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("profile")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/70">
            <p>{profile?.full_name || user.email}</p>
            <p className="text-white/40">{profile?.email}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("files")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {!files?.length ? (
            <p className="p-6 text-white/50">{t("noFiles")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                {files.map((file) => (
                  <TableRow key={file.id}>
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
                        <p className="mt-1 text-xs text-white/40">
                          {formatDate(file.expires_at)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <FileActions slug={file.slug} shareUrl={getPublicFileUrl(file.slug)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
