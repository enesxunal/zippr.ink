import { v4 as uuidv4 } from "uuid";
import { createServiceClient } from "@/lib/supabase/admin";
import {
  getPresignedDownloadUrl,
  getPublicR2Url,
  isR2Configured,
  uploadBufferToR2,
} from "@/lib/r2";
import { optimizeImage, type ApiOutputFormat } from "@/lib/image-optimizer/optimize-image";
import { formatJobId } from "@/lib/api/v1/constants";
import type { ImageJobRecord } from "@/types/database";

function sanitizeExt(format: string): string {
  if (format === "jpeg") return "jpg";
  return format.replace(/[^a-z0-9]/gi, "") || "bin";
}

async function publicUrlForKey(key: string): Promise<string> {
  const pub = getPublicR2Url(key);
  if (pub) return pub;
  return getPresignedDownloadUrl(key, 86400 * 7);
}

export interface RunOptimizationParams {
  userId: string;
  apiKeyId: string;
  sourceType: "upload" | "url";
  inputBuffer: Buffer;
  inputMime: string;
  originalExt: string;
  quality?: number;
  format?: ApiOutputFormat;
  maxWidth?: number | null;
  maxHeight?: number | null;
  stripMetadata?: boolean;
}

export async function runImageOptimizationJob(
  params: RunOptimizationParams
): Promise<ImageJobRecord> {
  if (!isR2Configured()) {
    throw new Error("storage_not_configured");
  }

  const admin = createServiceClient();
  const jobId = uuidv4();

  const { data: job, error: insertErr } = await admin
    .from("image_jobs")
    .insert({
      id: jobId,
      user_id: params.userId,
      api_key_id: params.apiKeyId,
      status: "processing",
      source_type: params.sourceType,
    })
    .select("*")
    .single<ImageJobRecord>();

  if (insertErr || !job) throw new Error("job_create_failed");

  try {
    const optimized = await optimizeImage(params.inputBuffer, params.inputMime, {
      quality: params.quality,
      format: params.format,
      maxWidth: params.maxWidth,
      maxHeight: params.maxHeight,
      stripMetadata: params.stripMetadata,
    });

    const origKey = `api-jobs/${params.userId}/${jobId}/original.${params.originalExt}`;
    const outExt = sanitizeExt(optimized.format);
    const optKey = `api-jobs/${params.userId}/${jobId}/optimized.${outExt}`;

    await uploadBufferToR2(origKey, params.inputBuffer, params.inputMime);
    await uploadBufferToR2(optKey, optimized.buffer, optimized.mimeType);

    const originalUrl = await publicUrlForKey(origKey);
    const optimizedUrl = await publicUrlForKey(optKey);

    const { data: updated, error: updateErr } = await admin
      .from("image_jobs")
      .update({
        status: "completed",
        original_url: originalUrl,
        optimized_url: optimizedUrl,
        original_size_bytes: optimized.originalSizeBytes,
        optimized_size_bytes: optimized.optimizedSizeBytes,
        compression_ratio: optimized.compressionRatio,
        format: optimized.format,
        width: optimized.width,
        height: optimized.height,
        error_code: null,
      })
      .eq("id", jobId)
      .select("*")
      .single<ImageJobRecord>();

    if (updateErr || !updated) throw new Error("job_update_failed");
    return updated;
  } catch (e) {
    await admin
      .from("image_jobs")
      .update({
        status: "failed",
        error_code: "optimization_failed",
      })
      .eq("id", jobId);
    throw e;
  }
}

export function jobToApiResponse(job: ImageJobRecord) {
  return {
    job_id: formatJobId(job.id),
    status: job.status,
    original_url: job.original_url,
    optimized_url: job.optimized_url,
    original_size_bytes: job.original_size_bytes,
    optimized_size_bytes: job.optimized_size_bytes,
    compression_ratio: job.compression_ratio != null ? Number(job.compression_ratio) : null,
    format: job.format,
    width: job.width,
    height: job.height,
    created_at: job.created_at,
  };
}

export async function getJobForUser(
  jobId: string,
  userId: string
): Promise<ImageJobRecord | null> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("image_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single<ImageJobRecord>();
  return data ?? null;
}
