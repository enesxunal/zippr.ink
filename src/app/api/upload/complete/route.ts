import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPublicFileUrl } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const admin = createServiceClient();

    const { data: file, error } = await admin
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

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
            storage_used: Number(profile.storage_used) + Number(file.file_size),
          })
          .eq("id", file.user_id);
      }
    }

    const shareUrl = getPublicFileUrl(file.slug);

    await admin.from("files").update({ download_url: shareUrl }).eq("id", fileId);

    return NextResponse.json({ shareUrl, slug: file.slug });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "complete_failed" }, { status: 500 });
  }
}
