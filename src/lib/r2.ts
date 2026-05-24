import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 client (S3-compatible).
 * Set these in .env.local:
 * - CLOUDFLARE_R2_ACCOUNT_ID
 * - CLOUDFLARE_R2_ACCESS_KEY_ID
 * - CLOUDFLARE_R2_SECRET_ACCESS_KEY
 * - CLOUDFLARE_R2_BUCKET_NAME
 * - CLOUDFLARE_R2_PUBLIC_URL (optional CDN domain)
 */
function getR2Client(): S3Client {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials not configured");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getBucketName(): string {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error("CLOUDFLARE_R2_BUCKET_NAME not set");
  return bucket;
}

/** Pre-signed PUT URL for direct client upload (bypasses VPS RAM) */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

/** Pre-signed GET URL for downloads */
export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getBucketName(),
      Key: key,
    })
  );
}

export async function batchDeleteFromR2(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => deleteFromR2(key)));
}

export function generateR2Key(userId: string | null, fileName: string): string {
  const prefix = userId ? `users/${userId}` : "guest";
  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${timestamp}-${safeName}`;
}

export function getPublicR2Url(key: string): string | null {
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!publicUrl) return null;
  return `${publicUrl.replace(/\/$/, "")}/${key}`;
}

export function isR2Configured(): boolean {
  return !!(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  );
}
