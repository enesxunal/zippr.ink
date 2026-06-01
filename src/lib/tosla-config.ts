import { createServiceClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/app-url";

export interface ToslaConfig {
  enabled: boolean;
  clientId: string;
  apiUser: string;
  merchantKey: string;
  apiPassword: string;
  apiUrl: string;
  callbackUrl: string;
  testMode: boolean;
}

const KEYS = [
  "tosla_enabled",
  "tosla_client_id",
  "tosla_api_user",
  "tosla_merchant_key",
  "tosla_api_password",
  "tosla_api_url",
  "tosla_test_mode",
] as const;

function envConfig(baseUrl: string): ToslaConfig {
  return {
    enabled: false,
    clientId: process.env.TOSLA_CLIENT_ID || "",
    apiUser: process.env.TOSLA_API_USER || "",
    merchantKey: process.env.TOSLA_MERCHANT_KEY || process.env.TOSLA_MERCHANT_ID || "",
    apiPassword: process.env.TOSLA_API_PASSWORD || "",
    apiUrl: process.env.TOSLA_API_URL || "https://entegrasyon.tosla.com/api/Payment/",
    callbackUrl:
      process.env.TOSLA_CALLBACK_URL || `${baseUrl}/api/payments/tosla/webhook`,
    testMode: process.env.TOSLA_TEST_MODE === "true",
  };
}

function isComplete(c: Pick<ToslaConfig, "clientId" | "apiUser" | "apiPassword">) {
  return Boolean(c.clientId?.trim() && c.apiUser?.trim() && c.apiPassword?.trim());
}

export async function getToslaConfig(): Promise<ToslaConfig> {
  const baseUrl = getAppBaseUrl();
  const fallback = envConfig(baseUrl);

  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from("system_metrics")
      .select("key, value")
      .in("key", [...KEYS]);

    if (error) throw error;

    const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));

    const hasDb = isComplete({
      clientId: map.tosla_client_id || "",
      apiUser: map.tosla_api_user || "",
      apiPassword: map.tosla_api_password || "",
    });

    if (!hasDb) {
      const envOk = isComplete(fallback);
      return { ...fallback, enabled: envOk };
    }

    return {
      enabled: map.tosla_enabled === "true",
      clientId: map.tosla_client_id || "",
      apiUser: map.tosla_api_user || "",
      merchantKey: map.tosla_merchant_key || "",
      apiPassword: map.tosla_api_password || "",
      apiUrl: map.tosla_api_url || fallback.apiUrl,
      callbackUrl: fallback.callbackUrl,
      testMode: map.tosla_test_mode === "true",
    };
  } catch {
    const envOk = isComplete(fallback);
    return { ...fallback, enabled: envOk };
  }
}

export async function saveToslaConfig(input: Partial<ToslaConfig>): Promise<void> {
  const admin = createServiceClient();
  const rows = [
    { key: "tosla_enabled", value: input.enabled ? "true" : "false" },
    { key: "tosla_client_id", value: (input.clientId || "").trim() },
    { key: "tosla_api_user", value: (input.apiUser || "").trim() },
    { key: "tosla_merchant_key", value: (input.merchantKey || "").trim() },
    { key: "tosla_api_password", value: input.apiPassword || "" },
    {
      key: "tosla_api_url",
      value: input.apiUrl?.trim() || "https://entegrasyon.tosla.com/api/Payment/",
    },
    { key: "tosla_test_mode", value: input.testMode ? "true" : "false" },
  ];

  const { error } = await admin.from("system_metrics").upsert(rows, { onConflict: "key" });

  if (error) {
    throw new Error(error.message);
  }
}
