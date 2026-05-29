import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { getPresignedDownloadUrl } from "@/lib/r2";
import { deleteFromR2 } from "@/lib/r2";
import { isSuperAdmin } from "@/lib/admin-access";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const admin = createServiceClient();

    const { data: file } = await admin
      .from("files")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (file.expires_at && new Date(file.expires_at) < new Date()) {
      return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    await admin
      .from("files")
      .update({ download_count: file.download_count + 1 })
      .eq("id", file.id);

    const url = await getPresignedDownloadUrl(file.r2_key, 3600);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const admin = createServiceClient();

    const { data: file } = await admin
      .from("files")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (file.user_id && file.user_id !== userId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      const adminUser = await isSuperAdmin(userId, profile?.email);
      if (!adminUser) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    if (!file.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .maybeSingle();
      const adminUser = await isSuperAdmin(userId, profile?.email);
      if (!adminUser) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    if (file.r2_key) {
      try {
        await deleteFromR2(file.r2_key);
      } catch {
        // continue
      }
    }

    await admin.from("files").update({ status: "deleted" }).eq("id", file.id);

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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
