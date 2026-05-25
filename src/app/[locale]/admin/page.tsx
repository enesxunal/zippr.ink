import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatBytes, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminUserActions } from "@/components/admin/admin-user-actions";
import { AdminQuoteActions } from "@/components/admin/admin-quote-actions";
import { AdminTicketActions } from "@/components/admin/admin-ticket-actions";
import type { UserRole } from "@/types/database";
import {
  Users,
  Euro,
  CreditCard,
  HardDrive,
  FileStack,
  Shield,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ZipprLogo } from "@/components/brand/zippr-logo";
import { AdminToslaSettings } from "@/components/admin/admin-tosla-settings";

export default async function AdminPage() {
  const supabase = await createClient();
  const t = await getTranslations("admin");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<{ role: UserRole }>();

  if (profile?.role !== "super_admin") redirect("/dashboard");

  const admin = createServiceClient();

  const [
    { count: userCount },
    { data: subscriptions },
    { data: files },
    { data: profiles },
    { data: quotes },
    { data: tickets },
    { data: metrics },
    { data: cronLogs },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("subscriptions").select("*").eq("status", "active"),
    admin.from("files").select("*").neq("status", "deleted"),
    admin.from("profiles").select("*").order("created_at", { ascending: false }),
    admin.from("quotes").select("*").order("created_at", { ascending: false }),
    admin.from("tickets").select("*").order("created_at", { ascending: false }),
    admin.from("system_metrics").select("*"),
    admin.from("cron_logs").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  const totalRevenue =
    subscriptions?.reduce((sum, s) => sum + Number(s.price), 0) || 0;
  const globalStorage =
    files?.reduce((sum, f) => sum + Number(f.file_size), 0) || 0;
  const backupStatus =
    metrics?.find((m) => m.key === "backup_status")?.value || "unknown";

  const kpis = [
    { label: t("totalUsers"), value: userCount || 0, icon: Users },
    { label: t("totalRevenue"), value: `€${totalRevenue.toFixed(2)}`, icon: Euro },
    {
      label: t("activeSubscriptions"),
      value: subscriptions?.length || 0,
      icon: CreditCard,
    },
    {
      label: t("globalStorage"),
      value: formatBytes(globalStorage),
      icon: HardDrive,
    },
    { label: t("filesProcessed"), value: files?.length || 0, icon: FileStack },
    { label: t("backupStatus"), value: backupStatus, icon: Shield },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ZipprLogo size="sm" linked />
          <h1 className="text-2xl font-bold">{t("title")}</h1>
        </div>
        <LogoutButton redirectTo="/admin/login" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-xl bg-violet/20 p-3">
                <Icon className="h-6 w-6 text-violet-light" />
              </div>
              <div>
                <p className="text-sm text-white/50">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("users")}</TabsTrigger>
          <TabsTrigger value="quotes">{t("quotes")}</TabsTrigger>
          <TabsTrigger value="tickets">{t("tickets")}</TabsTrigger>
          <TabsTrigger value="system">{t("system")}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardContent className="overflow-x-auto p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles?.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.email}
                        {p.is_banned && (
                          <Badge variant="destructive" className="ml-2">
                            Banned
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">{p.plan_type}</TableCell>
                      <TableCell>
                        {formatBytes(Number(p.storage_used))} /{" "}
                        {formatBytes(Number(p.storage_limit))}
                      </TableCell>
                      <TableCell>{formatDate(p.created_at)}</TableCell>
                      <TableCell>
                        <AdminUserActions userId={p.id} isBanned={p.is_banned} plan={p.plan_type} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes">
          <Card>
            <CardContent className="overflow-x-auto p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Storage GB</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes?.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>{q.company_name}</TableCell>
                      <TableCell>{q.email}</TableCell>
                      <TableCell>{q.user_count}</TableCell>
                      <TableCell>{q.requested_storage_gb} GB</TableCell>
                      <TableCell>
                        <Badge>{q.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <AdminQuoteActions quoteId={q.id} status={q.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardContent className="overflow-x-auto p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets?.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="max-w-xs truncate text-xs text-white/40">
                          {ticket.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ticket.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge>{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(ticket.created_at)}</TableCell>
                      <TableCell>
                        <AdminTicketActions ticketId={ticket.id} status={ticket.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <AdminToslaSettings />
          <Card>
            <CardHeader>
              <CardTitle>Cron Logs</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Freed</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cronLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.job_name}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "success" ? "success" : "destructive"}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.files_processed}</TableCell>
                      <TableCell>{formatBytes(Number(log.bytes_freed))}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.message}</TableCell>
                      <TableCell>{formatDate(log.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
