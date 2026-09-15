import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { isR2Configured, uploadBufferToR2 } from "@/lib/r2";
import { verifyUploadToken } from "@/lib/upload-token";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_DIRECT_PROXY_BYTES = 50 * 1024 * 1024;
// multipart/form-data adds some overhead around the raw file bytes.
const MAX_DIRECT_REQUEST_BYTES = 55 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: "r2_not_configured" }, { status: 503 });
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > MAX_DIRECT_REQUEST_BYTES) {
      return NextResponse.json({ error: "proxy_upload_too_large" }, { status: 413 });
    }

    const formData = await request.formData();
    const fileId = formData.get("fileId") as string | null;
    const uploadToken = formData.get("uploadToken") as string | null;
    const file = formData.get("file") as File | null;

    if (!fileId || !file || !uploadToken) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    if (file.size > MAX_DIRECT_PROXY_BYTES) {
      return NextResponse.json({ error: "proxy_upload_too_large" }, { status: 413 });
    }

    const token = verifyUploadToken(uploadToken, fileId);
    if (!token) {
      return NextResponse.json({ error: "invalid_upload_token" }, { status: 403 });
    }

    const admin = createServiceClient();
    const { data: record, error } = await admin
      .from("files")
      .select("user_id, r2_key, mime_type, file_size, status")
      .eq("id", fileId)
      .single();

    if (error || !record || record.status !== "active") {
      return NextResponse.json({ error: "file_not_found" }, { status: 404 });
    }

    const userId = await getUserIdFromRequest(request);
    if (record.user_id) {
      if (record.user_id !== userId || token.userId !== record.user_id) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    } else if (token.userId !== null) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const declaredSize = Number(record.file_size);
    if (!Number.isFinite(declaredSize) || declaredSize <= 0 || file.size !== declaredSize) {
      return NextResponse.json({ error: "file_size_mismatch" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || record.mime_type || "application/octet-stream";
    await uploadBufferToR2(record.r2_key, buffer, contentType);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Direct upload error:", err);
    return NextResponse.json({ error: "r2_upload_failed" }, { status: 500 });
  }
}
