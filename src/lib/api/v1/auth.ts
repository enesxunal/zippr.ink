import { createServiceClient } from "@/lib/supabase/admin";
import { hashApiKey, parseBearerToken } from "@/lib/api/v1/api-keys";
import type { ApiKeyRecord, PlanType, Profile } from "@/types/database";

export interface ApiAuthContext {
  userId: string;
  apiKeyId: string;
  planType: PlanType;
  mode: ApiKeyRecord["mode"];
}

export async function authenticateApiRequest(
  authHeader: string | null
): Promise<ApiAuthContext | null> {
  const token = parseBearerToken(authHeader);
  if (!token) return null;

  const admin = createServiceClient();
  const keyHash = hashApiKey(token);

  const { data: keyRow } = await admin
    .from("api_keys")
    .select("*")
    .eq("key_hash", keyHash)
    .is("revoked_at", null)
    .single<ApiKeyRecord>();

  if (!keyRow) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("plan_type, is_banned")
    .eq("id", keyRow.user_id)
    .single<Pick<Profile, "plan_type" | "is_banned">>();

  if (!profile || profile.is_banned) return null;

  return {
    userId: keyRow.user_id,
    apiKeyId: keyRow.id,
    planType: profile.plan_type,
    mode: keyRow.mode,
  };
}
