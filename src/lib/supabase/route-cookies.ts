import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

export type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function normalizeSameSite(value: unknown): "lax" | "strict" | "none" | undefined {
  if (value === "lax" || value === "strict" || value === "none") return value;
  if (value === true) return "lax";
  return "lax";
}

/** Supabase cookie seçeneklerini Next.js'in kabul ettiği forma çevirir (502/crash önler). */
export function applyCookiesToResponse(response: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    const o = options ?? {};
    if (!value) {
      response.cookies.delete(name);
      return;
    }
    response.cookies.set(name, value, {
      path: typeof o.path === "string" ? o.path : "/",
      maxAge: typeof o.maxAge === "number" ? o.maxAge : undefined,
      sameSite: normalizeSameSite(o.sameSite),
      secure: typeof o.secure === "boolean" ? o.secure : undefined,
      httpOnly: typeof o.httpOnly === "boolean" ? o.httpOnly : undefined,
    });
  });
}

export function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
}

/** Next.js 15: await cookies() + istek çerezleri birleştirilir (PKCE verifier) */
export async function createSupabaseCallbackClient(
  request: NextRequest,
  response: NextResponse
) {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase env missing");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        const merged = new Map<string, { name: string; value: string }>();
        for (const c of cookieStore.getAll()) merged.set(c.name, c);
        for (const c of request.cookies.getAll()) merged.set(c.name, c);
        return [...merged.values()];
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch (err) {
            console.error("[auth] cookieStore.set failed:", name, err);
          }
        });
        applyCookiesToResponse(response, cookiesToSet);
      },
    },
  });
}

export function createSupabaseRouteClient(request: NextRequest, response: NextResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase env missing");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        applyCookiesToResponse(response, cookiesToSet);
      },
    },
  });
}
