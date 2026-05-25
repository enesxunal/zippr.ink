import type { NextRequest } from "next/server";
import { handleAuthCallback } from "@/lib/auth-callback";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  return handleAuthCallback(request, locale);
}
