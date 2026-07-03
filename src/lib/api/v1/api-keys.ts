import { createHash, randomBytes } from "crypto";
import type { ApiKeyMode } from "@/types/database";
import {
  API_KEY_PREFIX_LIVE,
  API_KEY_PREFIX_TEST,
} from "@/lib/api/v1/constants";

export function hashApiKey(rawKey: string): string {
  const pepper = process.env.API_KEY_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHash("sha256").update(`${pepper}:${rawKey}`).digest("hex");
}

export function generateApiKey(mode: ApiKeyMode): {
  rawKey: string;
  prefix: string;
  hash: string;
} {
  const token = randomBytes(24).toString("base64url");
  const prefixBase = mode === "live" ? API_KEY_PREFIX_LIVE : API_KEY_PREFIX_TEST;
  const rawKey = `${prefixBase}${token}`;
  const prefix = rawKey.slice(0, Math.min(rawKey.length, 20));
  return { rawKey, prefix, hash: hashApiKey(rawKey) };
}

export function parseBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  if (
    !token.startsWith(API_KEY_PREFIX_LIVE) &&
    !token.startsWith(API_KEY_PREFIX_TEST)
  ) {
    return null;
  }
  return token;
}

export function maskApiKeyForLogs(key: string): string {
  if (key.length <= 16) return "***";
  return `${key.slice(0, 16)}…`;
}
