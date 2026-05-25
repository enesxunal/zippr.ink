import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isR2Configured, uploadBufferToR2 } from "@/lib/r2";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json({ error: "r2_not_configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const fileId = formData.get("fileId") as string | null;
    const file = formData.get("file") as File | null;

    if (!fileId || !file) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const admin = createServiceClient();
    const { data: record, error } = await admin
      .from("files")
      .select("r2_key, mime_type")
      .eq("id", fileId)
      .single();

    if (error || !record) {
      return NextResponse.json({ error: "file_not_found" }, { status: 404 });
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
