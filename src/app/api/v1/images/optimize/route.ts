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
import { withApiAuth, extFromMime } from "@/lib/api/v1/middleware";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseOptionalInt(val: FormDataEntryValue | null): number | null {
  if (val == null || val === "") return null;
  const n = Number(String(val));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function parseFormat(val: FormDataEntryValue | null): ApiOutputFormat {
  const s = String(val || "original").toLowerCase();
  if (API_ALLOWED_FORMATS.has(s)) return s as ApiOutputFormat;
  return "original";
}

export async function POST(request: NextRequest) {
  return withApiAuth(request, "/api/v1/images/optimize", async (ctx) => {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiError("invalid_request", "Expected multipart/form-data.", 400);
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return apiError("missing_file", "The file field is required.", 400);
    }

    const mime = (file.type || "application/octet-stream").toLowerCase();
    if (!API_ALLOWED_MIMES.has(mime)) {
      return apiError(
        "invalid_file_type",
        "Only JPEG, PNG, WebP, and AVIF images are allowed.",
        400
      );
    }

    if (file.size > API_MAX_FILE_BYTES) {
      return apiError(
        "file_too_large",
        `Maximum upload size is ${API_MAX_FILE_BYTES / (1024 * 1024)} MB.`,
        400,
        { max_bytes: API_MAX_FILE_BYTES }
      );
    }

    const qualityRaw = formData.get("quality");
    const quality =
      qualityRaw != null && qualityRaw !== ""
        ? Math.min(100, Math.max(1, Number(qualityRaw)))
        : 80;

    const format = parseFormat(formData.get("format"));
    const maxWidth = parseOptionalInt(formData.get("max_width"));
    const maxHeight = parseOptionalInt(formData.get("max_height"));
    const stripMetadata = formData.get("strip_metadata") !== "false";

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = extFromMime(mime);

    try {
      const job = await runImageOptimizationJob({
        userId: ctx.userId,
        apiKeyId: ctx.apiKeyId,
        sourceType: "upload",
        inputBuffer: buffer,
        inputMime: mime,
        originalExt: ext,
        quality,
        format,
        maxWidth,
        maxHeight,
        stripMetadata,
      });

      const data = jobToApiResponse(job);
      return apiSuccess({
        ...data,
        status: "completed",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "optimization_failed";
      if (msg === "storage_not_configured") {
        return apiError(
          "optimization_failed",
          "Image storage is not configured on the server.",
          503
        );
      }
      return apiError(
        "optimization_failed",
        "Image optimization failed. Please try again.",
        500
      );
    }
  });
}
