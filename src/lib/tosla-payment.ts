import crypto from "crypto";
import type { ToslaConfig } from "@/lib/tosla-config";

function makeRnd() {
  return crypto.randomBytes(12).toString("hex");
}

function makeHash(
  clientId: string,
  apiUser: string,
  rnd: string,
  timeSpan: string,
  amount: string,
  apiPassword: string
) {
  const raw = `${clientId}${apiUser}${rnd}${timeSpan}${amount}${apiPassword}`;
  return crypto.createHash("sha512").update(raw, "utf8").digest("base64");
}

/** Start 3D payment session — Tosla İşim API */
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
  const timeSpan = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const amountKurus = Math.round(params.amountTry * 100).toString();
  const hash = makeHash(
    config.clientId,
    config.apiUser,
    rnd,
    timeSpan,
    amountKurus,
    config.apiPassword
  );

  const payload = {
    clientId: config.clientId,
    apiUser: config.apiUser,
    rnd,
    timeSpan,
    hash,
    amount: amountKurus,
    currency: 949,
    orderId: params.orderId,
    callbackUrl: config.callbackUrl,
    returnUrl: params.returnUrl,
    description: params.description,
    customerEmail: params.customerEmail || "",
  };

  const endpoints = ["ThreeDSession", "StartPaymentThreeDSession", "CreateThreeDSession"];

  let lastError = "Tosla API unreachable";
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}/${ep}`, {
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

      if (!res.ok) {
        lastError = text.slice(0, 200);
        continue;
      }

      const sessionId =
        (data.ThreeDSessionId as string) ||
        (data.threeDSessionId as string) ||
        (data.sessionId as string);

      const checkoutUrl =
        (data.PaymentUrl as string) ||
        (data.paymentUrl as string) ||
        (data.redirectUrl as string) ||
        (sessionId ? `${base}/threeDSecure/${sessionId}` : "");

      if (checkoutUrl && sessionId) {
        return { checkoutUrl, threeDSessionId: sessionId };
      }
      lastError = "Invalid Tosla response";
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Tosla request failed";
    }
  }

  throw new Error(lastError);
}
