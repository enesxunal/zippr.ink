import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { batchDeleteFromR2 } from "@/lib/r2";

/**
 * Secure cron cleanup — requires Authorization: Bearer CRON_SECRET
 * Set CRON_SECRET in .env.local
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: expiredFiles, error } = await admin
    .from("files")
    .select("*")
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lt("expires_at", now);

  if (error) {
    await admin.from("cron_logs").insert({
      job_name: "cleanup",
      status: "failed",
      message: error.message,
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const files = expiredFiles || [];
  let bytesFreed = 0;
  const r2Keys = files.map((f) => f.r2_key).filter(Boolean);

  if (r2Keys.length > 0) {
    try {
      await batchDeleteFromR2(r2Keys);
    } catch (e) {
      console.error("R2 batch delete error:", e);
    }
  }

  for (const file of files) {
    bytesFreed += Number(file.file_size);
    await admin.from("files").update({ status: "expired" }).eq("id", file.id);

    if (file.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("storage_used")
        .eq("id", file.user_id)
        .single();

      if (profile) {
        await admin
          .from("profiles")
          .update({
            storage_used: Math.max(0, Number(profile.storage_used) - Number(file.file_size)),
          })
          .eq("id", file.user_id);
      }
    }
  }

  await admin.from("cron_logs").insert({
    job_name: "cleanup",
    status: "success",
    files_processed: files.length,
    bytes_freed: bytesFreed,
    message: `Cleaned ${files.length} expired files`,
  });

  await admin
    .from("system_metrics")
    .upsert({ key: "last_cleanup", value: now, updated_at: now });

  return NextResponse.json({
    success: true,
    filesProcessed: files.length,
    bytesFreed,
  });
}
