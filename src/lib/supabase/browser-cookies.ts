import { parse, serialize, type CookieSerializeOptions } from "cookie";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function serializeOptions(options?: Record<string, unknown>): CookieSerializeOptions {
  const o = options ?? {};
  const sameSite = o.sameSite;
  let resolvedSameSite: CookieSerializeOptions["sameSite"] = "lax";
  if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
    resolvedSameSite = sameSite;
  }
  return {
    path: typeof o.path === "string" ? o.path : "/",
    maxAge: typeof o.maxAge === "number" ? o.maxAge : undefined,
    sameSite: resolvedSameSite,
    secure: typeof o.secure === "boolean" ? o.secure : undefined,
  };
}

/** @supabase/ssr ile uyumlu tarayıcı cookie deposu (PKCE verifier dahil) */
export const browserCookieMethods = {
  getAll() {
    if (typeof document === "undefined") return [];
    const parsed = parse(document.cookie);
    return Object.keys(parsed).map((name) => ({
      name,
      value: parsed[name] ?? "",
    }));
  },
  setAll(cookiesToSet: CookieToSet[]) {
    if (typeof document === "undefined") return;
    cookiesToSet.forEach(({ name, value, options }) => {
      if (!value) {
        document.cookie = serialize(name, "", { ...serializeOptions(options), maxAge: 0 });
        return;
      }
      document.cookie = serialize(name, value, serializeOptions(options));
    });
  },
};
