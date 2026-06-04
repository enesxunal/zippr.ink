import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import type { ImageFormat } from "@/types/database";

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

  let pipeline = sharp(inputBuffer, { limitInputPixels: 268402689 });

    if (compress) {
      pipeline = pipeline.resize({
        width: 4096,
        height: 4096,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    let outputBuffer: Buffer;
    let mimeType: string;

    switch (format) {
      case "webp":
        outputBuffer = await pipeline.webp({ quality, effort: 4 }).toBuffer();
        mimeType = "image/webp";
        break;
      case "png":
        outputBuffer = await pipeline
          .png({ compressionLevel: compress ? 9 : 6, palette: compress })
          .toBuffer();
        mimeType = "image/png";
        break;
      case "jpeg":
        outputBuffer = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
        mimeType = "image/jpeg";
        break;
      case "gif":
        outputBuffer = await pipeline
          .gif({ effort: compress ? 7 : 5 })
          .toBuffer();
        mimeType = "image/gif";
        break;
      case "avif":
        outputBuffer = await pipeline.avif({ quality, effort: 4 }).toBuffer();
        mimeType = "image/avif";
        break;
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    return NextResponse.json({
      data: outputBuffer.toString("base64"),
      mimeType,
      size: outputBuffer.length,
      originalSize: inputBuffer.length,
      savings: Math.round((1 - outputBuffer.length / inputBuffer.length) * 100),
    });
  } catch (error) {
    console.error("Transform error:", error);
    return NextResponse.json({ error: "Transform failed" }, { status: 500 });
  }
}
