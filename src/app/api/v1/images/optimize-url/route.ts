import { NextRequest } from "next/server";
import {
  API_ALLOWED_FORMATS,
  API_ALLOWED_MIMES,
  API_MAX_FILE_BYTES,
} from "@/lib/api/v1/constants";
import { apiError, apiSuccess } from "@/lib/api/v1/errors";
import type { ApiOutputFormat } from "@/lib/image-optimizer/optimize-image";
import {
  jobToApiResponse,
  runImageOptimizationJob,
} from "@/lib/api/v1/image-job-service";
import { assertSafeImageUrl, fetchImageFromUrl } from "@/lib/api/v1/ssrf";
import { extFromMime, withApiAuth } from "@/lib/api/v1/middleware";

export const runtime = "nodejs";
export const maxDuration = 60;

interface OptimizeUrlBody {
  image_url?: string;
  quality?: number;
  format?: string;
  max_width?: number | null;
  max_height?: number | null;
  strip_metadata?: boolean;
}

export async function POST(request: NextRequest) {
  return withApiAuth(request, "/api/v1/images/optimize-url", async (ctx) => {
    let body: OptimizeUrlBody;
    try {
      body = await request.json();
    } catch {
      return apiError("invalid_request", "Invalid JSON body.", 400);
    }

    const imageUrl = body.image_url?.trim();
    if (!imageUrl) {
      return apiError("invalid_image_url", "The image_url field is required.", 400);
    }

    let parsedUrl;
    try {
      parsedUrl = await assertSafeImageUrl(imageUrl);
    } catch {
      return apiError(
        "invalid_image_url",
        "The provided image URL is invalid or unreachable.",
        400
      );
    }

    let fetched: { buffer: Buffer; mimeType: string };
    try {
      fetched = await fetchImageFromUrl(parsedUrl, API_MAX_FILE_BYTES);
    } catch {
      return apiError(
        "invalid_image_url",
        "The provided image URL is invalid or unreachable.",
        400
      );
    }

    const mime = fetched.mimeType.toLowerCase();
    if (!API_ALLOWED_MIMES.has(mime) && !mime.startsWith("image/")) {
      return apiError(
        "invalid_file_type",
        "The URL does not point to a supported image type.",
        400
      );
    }

    const normalizedMime = API_ALLOWED_MIMES.has(mime) ? mime : "image/jpeg";
    const quality =
      body.quality != null
        ? Math.min(100, Math.max(1, Math.round(Number(body.quality))))
        : 80;
    const formatRaw = (body.format || "original").toLowerCase();
    const format = API_ALLOWED_FORMATS.has(formatRaw)
      ? (formatRaw as ApiOutputFormat)
      : "original";

    try {
      const job = await runImageOptimizationJob({
        userId: ctx.userId,
        apiKeyId: ctx.apiKeyId,
        sourceType: "url",
        inputBuffer: fetched.buffer,
        inputMime: normalizedMime,
        originalExt: extFromMime(normalizedMime),
        quality,
        format,
        maxWidth: body.max_width ?? null,
        maxHeight: body.max_height ?? null,
        stripMetadata: body.strip_metadata !== false,
      });

      return apiSuccess({
        ...jobToApiResponse(job),
        status: "completed",
      });
    } catch {
      return apiError(
        "optimization_failed",
        "Image optimization failed. Please try again.",
        500
      );
    }
  });
}
