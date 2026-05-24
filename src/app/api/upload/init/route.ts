import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getPresignedUploadUrl, generateR2Key, isR2Configured } from "@/lib/r2";
import { canUpload, getExpiryDate, getStorageLimitForPlan } from "@/lib/plans";
import { isValidSlug } from "@/lib/utils";
import type { PlanType } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileSize, mimeType, customSlug, customName } = body;

    if (!fileName || !fileSize || !mimeType || !customSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!isValidSlug(customSlug)) {
      return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || null;
    let planType: PlanType = "free";
    let storageUsed = 0;
    let storageLimit = getStorageLimitForPlan("free");

    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profile?.is_banned) {
        return NextResponse.json({ error: "account_banned" }, { status: 403 });
      }

      if (profile) {
        planType = profile.plan_type;
        storageUsed = Number(profile.storage_used);
        storageLimit = Number(profile.storage_limit);
      }
    }

    const uploadCheck = canUpload(storageUsed, storageLimit, fileSize);
    if (!uploadCheck.allowed) {
      return NextResponse.json({ error: uploadCheck.reason }, { status: 403 });
    }

    const admin = createServiceClient();

    const { data: existingSlug } = await admin
      .from("files")
      .select("id")
      .eq("slug", customSlug)
      .eq("status", "active")
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    }

    const fileId = uuidv4();
    const r2Key = generateR2Key(userId, fileName);
    const expiresAt = getExpiryDate(planType, !userId);

    let presignedUrl: string | null = null;
    if (isR2Configured()) {
      presignedUrl = await getPresignedUploadUrl(r2Key, mimeType);
    }

    const { error: insertError } = await admin.from("files").insert({
      id: fileId,
      user_id: userId,
      slug: customSlug,
      original_name: fileName,
      custom_name: customName || fileName,
      file_size: fileSize,
      mime_type: mimeType,
      r2_key: r2Key,
      expires_at: expiresAt?.toISOString() || null,
      is_compressed: false,
      status: "active",
    });

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({
      fileId,
      presignedUrl,
      r2Key,
      useLocalFallback: !presignedUrl,
    });
  } catch (error) {
    console.error("Upload init error:", error);
    return NextResponse.json({ error: "init_failed" }, { status: 500 });
  }
}
