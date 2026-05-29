"use client";

import { parse, serialize, type CookieSerializeOptions } from "cookie";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

function toSerializeOptions(options?: Record<string, unknown>): CookieSerializeOptions {
  const o = options ?? {};
  const sameSite = o.sameSite;
  let resolved: CookieSerializeOptions["sameSite"] = "lax";
  if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
    resolved = sameSite;
  }
  return {
    path: typeof o.path === "string" ? o.path : "/",
    maxAge: typeof o.maxAge === "number" ? o.maxAge : undefined,
    sameSite: resolved,
    secure: typeof o.secure === "boolean" ? o.secure : undefined,
  };
}

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
        document.cookie = serialize(name, "", { ...toSerializeOptions(options), maxAge: 0 });
        return;
      }
      document.cookie = serialize(name, value, toSerializeOptions(options));
    });
  },
};
