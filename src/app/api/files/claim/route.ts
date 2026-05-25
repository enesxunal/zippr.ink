import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";

/** Links recent guest uploads (no owner) to the logged-in user — max 20, last 48h. */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { slugs } = (await request.json()) as { slugs?: string[] };
    if (!slugs?.length) {
      return NextResponse.json({ linked: 0 });
    }

    const admin = createServiceClient();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await admin
      .from("files")
      .update({ user_id: userId })
      .in("slug", slugs.slice(0, 20))
      .is("user_id", null)
      .eq("status", "active")
      .gte("created_at", since)
      .select("slug");

    if (error) {
      return NextResponse.json({ error: "claim_failed" }, { status: 500 });
    }

    return NextResponse.json({ linked: data?.length ?? 0, slugs: data?.map((f) => f.slug) });
  } catch {
    return NextResponse.json({ error: "claim_failed" }, { status: 500 });
  }
}
