import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { getPublicFileUrl } from "@/lib/app-url";

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const admin = createServiceClient();
    const userId = await getUserIdFromRequest(request);

    const { data: file, error } = await admin
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (userId) {
      await admin.from("files").update({ user_id: userId }).eq("id", fileId);
      file.user_id = userId;
    }

    const ownerId = file.user_id || userId;

    if (ownerId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("storage_used")
        .eq("id", ownerId)
        .single();

      if (profile) {
        await admin
          .from("profiles")
          .update({
            storage_used: Number(profile.storage_used) + Number(file.file_size),
          })
          .eq("id", ownerId);
      }
    }

    const shareUrl = getPublicFileUrl(file.slug, request);

    await admin.from("files").update({ download_url: shareUrl }).eq("id", fileId);

    return NextResponse.json({ shareUrl, slug: file.slug });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "complete_failed" }, { status: 500 });
  }
}
