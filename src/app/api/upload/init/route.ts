import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createServiceClient } from "@/lib/supabase/admin";
import { getUserIdFromRequest } from "@/lib/auth-api";
import { getPresignedUploadUrl, generateR2Key, isR2Configured } from "@/lib/r2";
import { canUpload, getExpiryDate, getStorageLimitForPlan } from "@/lib/plans";
import { resolveUniqueSlug, createDefaultUploadSlug } from "@/lib/slug";
import { isValidSlug, slugify } from "@/lib/utils";
import type { PlanType } from "@/types/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileSize, mimeType, customSlug, customName, useCustomSlug } = body;

    if (!fileName || !fileSize) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const userId = await getUserIdFromRequest(request);

    let slugBase: string;
    if (useCustomSlug && customSlug) {
      slugBase = slugify(customSlug);
      if (!isValidSlug(slugBase)) {
        return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
      }
    } else {
      slugBase = createDefaultUploadSlug();
    }
    let planType: PlanType = "free";
    let storageUsed = 0;
    let storageLimit = getStorageLimitForPlan("free");

    const admin = createServiceClient();

    if (userId) {
      const { data: profile } = await admin
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

    const { slug: finalSlug, adjusted: slugAdjusted } = await resolveUniqueSlug(
      admin,
      slugBase
    );

    const fileId = uuidv4();
    const r2Key = generateR2Key(userId, fileName);
    const expiresAt = getExpiryDate(planType, !userId);

    const safeMime =
      typeof mimeType === "string" && mimeType.trim()
        ? mimeType.trim()
        : "application/octet-stream";

    let presignedUrl: string | null = null;
    if (isR2Configured()) {
      try {
        presignedUrl = await getPresignedUploadUrl(r2Key, safeMime);
      } catch (e) {
        console.error("Presign failed:", e);
      }
    }

    const { error: insertError } = await admin.from("files").insert({
      id: fileId,
      user_id: userId,
      slug: finalSlug,
      original_name: fileName,
      custom_name: customName || fileName,
      file_size: fileSize,
      mime_type: safeMime,
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
      slug: finalSlug,
      slugAdjusted,
      useLocalFallback: !presignedUrl,
    });
  } catch (error) {
    console.error("Upload init error:", error);
    return NextResponse.json({ error: "init_failed" }, { status: 500 });
  }
}
