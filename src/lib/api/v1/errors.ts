import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "unauthorized"
  | "invalid_api_key"
  | "rate_limit_exceeded"
  | "invalid_file_type"
  | "file_too_large"
  | "invalid_image_url"
  | "optimization_failed"
  | "job_not_found"
  | "internal_error"
  | "invalid_request"
  | "missing_file";

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}
