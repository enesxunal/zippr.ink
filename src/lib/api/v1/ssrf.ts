import { isIP } from "net";
import { lookup } from "dns/promises";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") return true;
  const v = isIP(ip);
  if (v === 4) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80")) return true;
  }
  return false;
}

export function isValidPublicImageUrl(raw: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host)) return false;
  if (host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (isIP(host) && isPrivateIp(host)) return false;
  return true;
}

/** Resolve hostname and reject private IPs (SSRF protection) */
export async function assertSafeImageUrl(raw: string): Promise<URL> {
  if (!isValidPublicImageUrl(raw)) {
    throw new Error("invalid_image_url");
  }
  const parsed = new URL(raw);
  const host = parsed.hostname;
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("invalid_image_url");
    return parsed;
  }
  try {
    const records = await lookup(host, { all: true });
    for (const r of records) {
      if (isPrivateIp(r.address)) throw new Error("invalid_image_url");
    }
  } catch (e) {
    if (e instanceof Error && e.message === "invalid_image_url") throw e;
    throw new Error("invalid_image_url");
  }
  return parsed;
}

export async function fetchImageFromUrl(url: URL, maxBytes: number): Promise<{
  buffer: Buffer;
  mimeType: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: { Accept: "image/*" },
    });
    if (!res.ok) throw new Error("unreachable");
    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim();
    const len = Number(res.headers.get("content-length") || 0);
    if (len > maxBytes) throw new Error("too_large");
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength > maxBytes) throw new Error("too_large");
    return {
      buffer: Buffer.from(arrayBuf),
      mimeType: contentType || "image/jpeg",
    };
  } finally {
    clearTimeout(timeout);
  }
}
