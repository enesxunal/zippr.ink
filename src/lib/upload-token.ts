import crypto from "crypto";

const TTL_SECONDS = 60 * 30;

type UploadTokenPayload = {
  fileId: string;
  userId: string | null;
  exp: number;
};

function secret(): string {
  const value = process.env.UPLOAD_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("upload_token_secret_missing");
  return value;
}

function sign(encodedPayload: string): string {
  return crypto.createHmac("sha256", secret()).update(encodedPayload).digest("base64url");
}

export function createUploadToken(fileId: string, userId: string | null): string {
  const payload: UploadTokenPayload = {
    fileId,
    userId,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifyUploadToken(token: string | null | undefined, expectedFileId: string): UploadTokenPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as UploadTokenPayload;
    if (payload.fileId !== expectedFileId) return null;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
