import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@supabase/supabase-js", "@supabase/ssr"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    // The app uses Route Handlers for uploads, not Server Actions. Keep this small to reduce DoS surface.
    serverActions: { bodySizeLimit: "2mb" },
    webpackMemoryOptimizations: true,
  },
};

const configWithIntl = withNextIntl(nextConfig);
const skipSentryWebpack =
  process.env.SENTRY_DISABLE_WEBPACK === "1" || process.env.LOW_MEMORY_BUILD === "1";

const sentryOptions = {
  org: process.env.SENTRY_ORG || "zippr-uj",
  project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  silent: true,
  widenClientFileUpload: false,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    autoUploadSourceMaps: false,
  },
};

export default skipSentryWebpack
  ? configWithIntl
  : withSentryConfig(configWithIntl, sentryOptions);
