import type { PlanType } from "@/types/database";

export const API_VERSION = "1.0.0";
export const API_MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const API_ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const API_ALLOWED_FORMATS = new Set(["original", "webp", "avif", "jpeg", "png"]);

/** Daily API request limits per plan tier */
export const API_DAILY_LIMITS: Record<PlanType, number> = {
  free: 50,
  lite: 1000,
  standard: 1000,
  professional: 10000,
  enterprise: 10000,
};

export const API_KEY_PREFIX_LIVE = "zippr_live_";
export const API_KEY_PREFIX_TEST = "zippr_test_";

export function formatJobId(id: string): string {
  return `job_${id.replace(/-/g, "")}`;
}

export function parseJobId(jobId: string): string | null {
  if (!jobId.startsWith("job_")) return null;
  const raw = jobId.slice(4);
  if (raw.length !== 32) return null;
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}
