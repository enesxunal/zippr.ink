import crypto from "crypto";
import type { ToslaConfig } from "@/lib/tosla-config";

function makeRnd() {
  return crypto.randomBytes(12).toString("hex");
}

/** Tosla İşim: ApiPass + ClientId + ApiUser + Rnd + TimeSpan → SHA512 → Base64 */
function makeHash(
  apiPassword: string,
  clientId: string,
  apiUser: string,
  rnd: string,
  timeSpan: string
) {
  const raw = `${apiPassword}${clientId}${apiUser}${rnd}${timeSpan}`;
  return crypto.createHash("sha512").update(raw, "utf8").digest("base64");
}

function istanbulTimeSpan(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

/** 3D ödeme oturumu — Tosla İşim threeDPayment */
export async function createToslaCheckout(
  config: ToslaConfig,
  params: {
    amountTry: number;
    orderId: string;
    customerEmail?: string;
    description: string;
    returnUrl: string;
  }
): Promise<{ checkoutUrl: string; threeDSessionId: string }> {
  const base = config.apiUrl.replace(/\/?$/, "/");
  const rnd = makeRnd();
  const timeSpan = istanbulTimeSpan();
  const amountKurus = Math.round(params.amountTry * 100);
  const hash = makeHash(
    config.apiPassword,
    config.clientId,
    config.apiUser,
    rnd,
    timeSpan
  );

  const payload = {
    clientId: Number(config.clientId) || config.clientId,
    apiUser: config.apiUser,
    rnd,
    timeSpan,
    hash,
    amount: amountKurus,
    currency: 949,
    orderId: params.orderId.slice(0, 20),
    callbackUrl: config.callbackUrl,
    description: params.description.slice(0, 256),
    installmentCount: 0,
    echo: params.customerEmail?.slice(0, 256) || "",
  };

  const endpoints = ["threeDPayment", "ThreeDPayment", "ThreeDSession"];

  let lastError = "Tosla API unreachable";
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(text) as Record<string, unknown>;
      } catch {
        data = { raw: text };
      }

      const code = data.Code ?? data.code;
      if (!res.ok || (code !== undefined && code !== 0 && code !== "0")) {
        lastError =
          String(data.Message || data.message || text).slice(0, 300) ||
          `HTTP ${res.status}`;
        continue;
      }

      const sessionId =
        (data.ThreeDSessionId as string) ||
        (data.threeDSessionId as string) ||
        (data.sessionId as string);

      if (!sessionId) {
        lastError = "ThreeDSessionId missing";
        continue;
      }

      const checkoutUrl =
        (data.PaymentUrl as string) ||
        (data.paymentUrl as string) ||
        (data.redirectUrl as string) ||
        `${base.replace(/\/api\/Payment\/?$/i, "")}/api/Payment/threeDSecure/${sessionId}`;

      return { checkoutUrl, threeDSessionId: sessionId };
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Tosla request failed";
    }
  }

  throw new Error(lastError);
}
