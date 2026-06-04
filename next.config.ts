import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "100mb",
    },
    middlewareClientMaxBodySize: "100mb",
    webpackMemoryOptimizations: true,
  },
};

const configWithIntl = withNextIntl(nextConfig);

/** Küçük VPS'te build RAM yetmez — sunucuda SENTRY_DISABLE_WEBPACK=1 (runtime Sentry yine çalışır) */
const skipSentryWebpack =
  process.env.SENTRY_DISABLE_WEBPACK === "1" || process.env.LOW_MEMORY_BUILD === "1";

const sentryOptions = {
  org: process.env.SENTRY_ORG || "zippr-uj",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  silent: true,
  widenClientFileUpload: false,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    disable: true,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
    autoUploadSourceMaps: false,
  },
};

export default skipSentryWebpack
  ? configWithIntl
  : withSentryConfig(configWithIntl, sentryOptions);
