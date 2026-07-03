import { NextResponse } from "next/server";
import { API_VERSION } from "@/lib/api/v1/constants";
import { apiSuccess } from "@/lib/api/v1/errors";

export const runtime = "nodejs";

export async function GET() {
  return apiSuccess({
    service: "zippr-ink-api",
    version: API_VERSION,
    status: "healthy",
  });
}
