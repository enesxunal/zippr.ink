import { createServiceClient } from "@/lib/supabase/admin";

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

export async function getToslaConfig(): Promise<ToslaConfig> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const fallback: ToslaConfig = {
    enabled: false,
    clientId: process.env.TOSLA_CLIENT_ID || "",
    apiUser: process.env.TOSLA_API_USER || "",
    merchantKey: process.env.TOSLA_MERCHANT_KEY || process.env.TOSLA_MERCHANT_ID || "",
    apiPassword: process.env.TOSLA_API_PASSWORD || process.env.TOSLA_MERCHANT_KEY || "",
    apiUrl: process.env.TOSLA_API_URL || "https://entegrasyon.tosla.com/api/Payment/",
    callbackUrl:
      process.env.TOSLA_CALLBACK_URL || `${baseUrl}/api/payments/tosla/webhook`,
    testMode: process.env.TOSLA_TEST_MODE === "true",
  };

  try {
    const admin = createServiceClient();
    const { data } = await admin.from("system_metrics").select("key, value").in("key", [...KEYS]);

    const map = Object.fromEntries((data || []).map((r) => [r.key, r.value]));

    const hasDb =
      map.tosla_client_id && map.tosla_api_user && map.tosla_merchant_key && map.tosla_api_password;

    if (!hasDb) {
      const envOk = fallback.clientId && fallback.apiUser && fallback.merchantKey && fallback.apiPassword;
      return { ...fallback, enabled: Boolean(envOk) };
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
    const envOk =
      fallback.clientId && fallback.apiUser && fallback.merchantKey && fallback.apiPassword;
    return { ...fallback, enabled: Boolean(envOk) };
  }
}

export async function saveToslaConfig(input: Partial<ToslaConfig>): Promise<void> {
  const admin = createServiceClient();
  const rows = [
    { key: "tosla_enabled", value: input.enabled ? "true" : "false" },
    { key: "tosla_client_id", value: input.clientId || "" },
    { key: "tosla_api_user", value: input.apiUser || "" },
    { key: "tosla_merchant_key", value: input.merchantKey || "" },
    { key: "tosla_api_password", value: input.apiPassword || "" },
    { key: "tosla_api_url", value: input.apiUrl || "https://entegrasyon.tosla.com/api/Payment/" },
    { key: "tosla_test_mode", value: input.testMode ? "true" : "false" },
  ];
  for (const row of rows) {
    await admin.from("system_metrics").upsert(row);
  }
}
