import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { routing } from "@/i18n/routing";
import type { UserRole } from "@/types/database";
import { formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilesTable } from "@/components/dashboard/files-table";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ClaimRecentUpload } from "@/components/dashboard/claim-recent-upload";
import { LinkSlugToAccount } from "@/components/dashboard/link-slug-to-account";
import { ZipprLogo } from "@/components/brand/zippr-logo";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations("dashboard");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if ((profile?.role as UserRole | undefined) === "super_admin") {
    redirect(locale === routing.defaultLocale ? "/admin" : `/${locale}/admin`);
  }

  const admin = createServiceClient();
  const { data: files } = await admin
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
      <ClaimRecentUpload />
      <LinkSlugToAccount />
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ZipprLogo size="sm" linked />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/pricing">
            <Button variant="outline">{t("upgradePlan")}</Button>
          </Link>
          <LogoutButton />
        </div>
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
            <FilesTable files={files} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
