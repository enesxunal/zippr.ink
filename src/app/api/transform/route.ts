import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import type { ImageFormat } from "@/types/database";
import { optimizeImage } from "@/lib/image-optimizer/optimize-image";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, format, quality = 82, compress = true } = body as {
      imageData: string;
      format: ImageFormat;
      quality?: number;
      compress?: boolean;
    };

    if (!imageData || !format) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(imageData, "base64");
    const inputMime =
      format === "png"
        ? "image/png"
        : format === "webp"
          ? "image/webp"
          : format === "avif"
            ? "image/avif"
            : format === "gif"
              ? "image/gif"
              : "image/jpeg";

    if (format === "gif") {
      let pipeline = sharp(inputBuffer, { limitInputPixels: 268402689 });
      if (compress) {
        pipeline = pipeline.resize({
          width: 4096,
          height: 4096,
          fit: "inside",
          withoutEnlargement: true,
        });
      }
      const outputBuffer = await pipeline.gif({ effort: compress ? 7 : 5 }).toBuffer();
      return NextResponse.json({
        data: outputBuffer.toString("base64"),
        mimeType: "image/gif",
        size: outputBuffer.length,
        originalSize: inputBuffer.length,
        savings: Math.round((1 - outputBuffer.length / inputBuffer.length) * 100),
      });
    }

    const apiFormat =
      format === "jpeg" ? "jpeg" : format === "png" ? "png" : format === "webp" ? "webp" : "avif";

    const result = await optimizeImage(inputBuffer, inputMime, {
      quality,
      format: apiFormat,
      maxWidth: compress ? 4096 : null,
      maxHeight: compress ? 4096 : null,
      stripMetadata: false,
    });

    return NextResponse.json({
      data: result.buffer.toString("base64"),
      mimeType: result.mimeType,
      size: result.optimizedSizeBytes,
      originalSize: result.originalSizeBytes,
      savings: Math.round(result.compressionRatio),
    });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json({ error: "Transform failed" }, { status: 500 });
  }
}
