import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { linkFilesToUser } from "@/lib/link-file-to-user";

/** Sahipsiz yüklemeleri giriş yapmış kullanıcıya bağlar — en fazla 20, son 90 gün. */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { slugs } = (await request.json()) as { slugs?: string[] };
    if (!slugs?.length) {
      return NextResponse.json({ linked: 0, alreadyOwned: [] });
    }

    const cleanSlugs = slugs
      .map((s) => s.trim().replace(/^.*\//, ""))
      .filter(Boolean)
      .slice(0, 20);

    const admin = createServiceClient();
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: alreadyMine } = await admin
      .from("files")
      .select("slug")
      .in("slug", cleanSlugs)
      .eq("user_id", userId)
      .eq("status", "active");

    const { data: toClaim, error: fetchError } = await admin
      .from("files")
      .select("id, slug, file_size")
      .in("slug", cleanSlugs)
      .is("user_id", null)
      .eq("status", "active")
      .gte("created_at", since);

    if (fetchError) {
      return NextResponse.json({ error: "claim_failed" }, { status: 500 });
    }

    const linkedSlugs = toClaim?.length
      ? await linkFilesToUser(admin, userId, toClaim)
      : [];

    return NextResponse.json({
      linked: linkedSlugs.length,
      slugs: linkedSlugs,
      alreadyOwned: alreadyMine?.map((f) => f.slug) ?? [],
    });
  } catch {
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }
}
