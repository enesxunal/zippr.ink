import { createServiceClient } from "@/lib/supabase/admin";
import type { PlanType } from "@/types/database";
import { API_DAILY_LIMITS } from "@/lib/api/v1/constants";

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function getDailyApiUsageCount(userId: string): Promise<number> {
  const admin = createServiceClient();
  const since = startOfUtcDay();
  const { count, error } = await admin
    .from("api_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if (error) throw new Error("api_usage_unavailable");
  return count ?? 0;
}

export async function checkRateLimit(
  userId: string,
  planType: PlanType
): Promise<{ allowed: boolean; limit: number; used: number }> {
  const limit = API_DAILY_LIMITS[planType] ?? API_DAILY_LIMITS.free;
  const used = await getDailyApiUsageCount(userId);
  return { allowed: used < limit, limit, used };
}

export async function logApiUsage(params: {
  userId: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
}): Promise<void> {
  const admin = createServiceClient();
  await admin.from("api_usage").insert({
    user_id: params.userId,
    api_key_id: params.apiKeyId,
    endpoint: params.endpoint,
    method: params.method,
    status_code: params.statusCode,
  });
}

export async function touchApiKey(apiKeyId: string): Promise<void> {
  const admin = createServiceClient();
  await admin.rpc("touch_api_key", { target_key: apiKeyId });
}
