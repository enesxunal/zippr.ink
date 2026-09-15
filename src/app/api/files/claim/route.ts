import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { linkFilesToUser } from "@/lib/link-file-to-user";
import { verifyUploadToken } from "@/lib/upload-token";

/** Links recent guest uploads to the authenticated account only with the upload capability token. */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = (await request.json()) as { claims?: Array<{ slug?: string; uploadToken?: string }> };
    const claims = (body.claims || [])
      .map((c) => ({ slug: c.slug?.trim().replace(/^.*\//, "") || "", uploadToken: c.uploadToken || "" }))
      .filter((c) => c.slug && c.uploadToken)
      .slice(0, 20);
    if (!claims.length) return NextResponse.json({ linked: 0, completed: true });

    const admin = createServiceClient();
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const slugs = claims.map((c) => c.slug);

    const { data: files, error } = await admin
      .from("files")
      .select("id, slug, user_id, file_size")
      .in("slug", slugs)
      .eq("status", "active")
      .gte("created_at", since);
    if (error) return NextResponse.json({ error: "claim_failed" }, { status: 500 });

    const bySlug = new Map((files || []).map((file) => [file.slug as string, file]));
    const validGuestFiles = [];
    let accountedFor = 0;

    for (const claim of claims) {
      const file = bySlug.get(claim.slug);
      if (!file) continue;
      if (file.user_id === userId) {
        accountedFor += 1;
        continue;
      }
      if (file.user_id) continue;
      const token = verifyUploadToken(claim.uploadToken, file.id);
      if (!token || token.userId !== null) continue;
      validGuestFiles.push(file);
    }

    const linkedSlugs = validGuestFiles.length
      ? await linkFilesToUser(admin, userId, validGuestFiles)
      : [];
    accountedFor += linkedSlugs.length;

    return NextResponse.json({
      linked: linkedSlugs.length,
      slugs: linkedSlugs,
      completed: accountedFor === claims.length,
    });
  } catch {
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }
}
