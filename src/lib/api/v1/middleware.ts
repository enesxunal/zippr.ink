import type { NextRequest } from "next/server";
import { authenticateApiRequest } from "@/lib/api/v1/auth";
import { apiError } from "@/lib/api/v1/errors";
import {
  checkRateLimit,
  logApiUsage,
  touchApiKey,
} from "@/lib/api/v1/rate-limit";
import type { ApiAuthContext } from "@/lib/api/v1/auth";

export async function withApiAuth(
  request: NextRequest,
  endpoint: string,
  handler: (ctx: ApiAuthContext) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const ctx = await authenticateApiRequest(authHeader);

  if (!ctx) {
    return apiError(
      "invalid_api_key",
      "Invalid or missing API key. Use Authorization: Bearer zippr_live_…",
      401
    );
  }

  const rate = await checkRateLimit(ctx.userId, ctx.planType);
  if (!rate.allowed) {
    const res = apiError(
      "rate_limit_exceeded",
      "API rate limit exceeded for your current plan.",
      429,
      { limit: rate.limit, used: rate.used }
    );
    await logApiUsage({
      userId: ctx.userId,
      apiKeyId: ctx.apiKeyId,
      endpoint,
      method: request.method,
      statusCode: 429,
    });
    return res;
  }

  let response: Response;
  try {
    response = await handler(ctx);
  } catch {
    response = apiError("internal_error", "An unexpected error occurred.", 500);
  }

  await touchApiKey(ctx.apiKeyId);
  await logApiUsage({
    userId: ctx.userId,
    apiKeyId: ctx.apiKeyId,
    endpoint,
    method: request.method,
    statusCode: response.status,
  });

  return response;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "image";
}

export function extFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("avif")) return "avif";
  return "jpg";
}
