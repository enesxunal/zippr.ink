import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { getPublicFileUrl } from "@/lib/app-url";
import { canUpload } from "@/lib/plans";
import { deleteFromR2, getR2ObjectSize } from "@/lib/r2";
import { verifyUploadToken } from "@/lib/upload-token";

export async function POST(request: NextRequest) {
  try {
    const { fileId, uploadToken } = await request.json();
    if (!fileId || !uploadToken) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const token = verifyUploadToken(uploadToken, fileId);
    if (!token) {
      return NextResponse.json({ error: "invalid_upload_token" }, { status: 403 });
    }

    const admin = createServiceClient();
    const userId = await getUserIdFromRequest(request);
    const { data: file, error } = await admin
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error || !file || file.status !== "active") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (file.user_id) {
      if (file.user_id !== userId || token.userId !== file.user_id) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    } else if (token.userId !== null) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // download_url is written only after a successful completion; makes retries idempotent.
    if (file.download_url) {
      return NextResponse.json({ shareUrl: file.download_url, slug: file.slug, alreadyCompleted: true });
    }

    let actualSize: number;
    try {
      actualSize = await getR2ObjectSize(file.r2_key);
    } catch {
      return NextResponse.json({ error: "upload_not_found" }, { status: 409 });
    }

    if (file.user_id) {
      const { data: profile } = await admin
        .from("profiles")
        .select("storage_used, storage_limit")
        .eq("id", file.user_id)
        .single();

      if (!profile) {
        return NextResponse.json({ error: "profile_not_found" }, { status: 409 });
      }

      const quota = canUpload(Number(profile.storage_used), Number(profile.storage_limit), actualSize);
      if (!quota.allowed) {
        await deleteFromR2(file.r2_key).catch(() => undefined);
        await admin.from("files").update({ status: "deleted" }).eq("id", file.id);
        return NextResponse.json({ error: quota.reason }, { status: 403 });
      }
    }

    const shareUrl = getPublicFileUrl(file.slug, request);
    const { data: completed, error: updateError } = await admin
      .from("files")
      .update({ file_size: actualSize, download_url: shareUrl })
      .eq("id", fileId)
      .is("download_url", null)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: "complete_failed" }, { status: 500 });
    }

    // Another concurrent request may have completed it first.
    if (!completed) {
      const { data: latest } = await admin.from("files").select("download_url, slug").eq("id", fileId).single();
      return NextResponse.json({ shareUrl: latest?.download_url || shareUrl, slug: latest?.slug || file.slug, alreadyCompleted: true });
    }

    if (file.user_id) {
      await admin.rpc("adjust_storage_used", {
        target_user: file.user_id,
        delta: actualSize,
      });
    }

    return NextResponse.json({ shareUrl, slug: file.slug });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "complete_failed" }, { status: 500 });
  }
}
