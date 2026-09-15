import crypto from "crypto";

export type ToslaCallbackPayload = Record<string, string>;

function field(payload: ToslaCallbackPayload, name: string): string {
  const direct = payload[name];
  if (direct !== undefined) return String(direct);
  const key = Object.keys(payload).find((k) => k.toLowerCase() === name.toLowerCase());
  return key ? String(payload[key] ?? "") : "";
}

export function getToslaCallbackField(payload: ToslaCallbackPayload, ...names: string[]): string {
  for (const name of names) {
    const value = field(payload, name);
    if (value !== "") return value;
  }
  return "";
}

export function verifyToslaCallbackHash(payload: ToslaCallbackPayload, apiPassword: string): boolean {
  const parameters = getToslaCallbackField(payload, "HashParameters", "hashParameters");
  const receivedHash = getToslaCallbackField(payload, "Hash", "hash");
  if (!parameters || !receivedHash || !apiPassword) return false;

  const names = parameters.split(",").map((v) => v.trim()).filter(Boolean);
  if (!names.length || names.length > 40) return false;
  const raw = apiPassword + names.map((name) => field(payload, name)).join("");
  const expected = crypto.createHash("sha512").update(raw, "utf8").digest("base64");

  const a = Buffer.from(receivedHash);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isSuccessfulToslaCallback(payload: ToslaCallbackPayload): boolean {
  const mdStatus = getToslaCallbackField(payload, "MdStatus", "mdStatus");
  const bankCode = getToslaCallbackField(payload, "BankResponseCode", "bankResponseCode");
  const requestStatus = getToslaCallbackField(payload, "RequestStatus", "requestStatus");

  if (mdStatus && mdStatus !== "1") return false;
  if (bankCode && bankCode !== "00" && bankCode !== "0") return false;
  if (requestStatus && requestStatus !== "1") return false;

  return Boolean(mdStatus || bankCode || requestStatus);
}
