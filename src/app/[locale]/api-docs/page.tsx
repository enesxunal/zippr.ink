import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { API_DAILY_LIMITS } from "@/lib/api/v1/constants";

export const metadata: Metadata = {
  title: "API Documentation | zippr.ink",
  description:
    "Integrate zippr.ink image optimization into your app. Upload images, optimize by URL, and retrieve compression stats via REST API.",
  alternates: { canonical: "https://zippr.ink/api-docs" },
};

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://zippr.ink";

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-4 text-xs text-white/80">
      <code>{children.trim()}</code>
    </pre>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">zippr.ink Image API</h1>
      <p className="mb-8 text-white/60">
        Optimize images from your website, app, or backend. Authenticate with an API key from your{" "}
        <Link href="/dashboard/api-keys" className="text-violet-light hover:underline">
          dashboard
        </Link>
        .
      </p>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Authentication</h2>
        <p className="text-sm text-white/60">
          Send your API key in the <code className="text-violet-light">Authorization</code> header:
        </p>
        <Code>{`Authorization: Bearer zippr_live_your_api_key`}</Code>
        <p className="text-sm text-white/60">
          Keys use the format <code className="text-violet-light">zippr_live_…</code> (production) or{" "}
          <code className="text-violet-light">zippr_test_…</code> (testing). Create keys in{" "}
          <Link href="/dashboard/api-keys" className="text-violet-light hover:underline">
            Dashboard → API Keys
          </Link>
          . The full key is shown only once at creation.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Rate limits</h2>
        <p className="text-sm text-white/60">Daily request limits per account plan (UTC day):</p>
        <ul className="list-inside list-disc text-sm text-white/70">
          <li>Free — {API_DAILY_LIMITS.free} requests/day</li>
          <li>Lite / Standard — {API_DAILY_LIMITS.lite} requests/day</li>
          <li>Professional / Enterprise — {API_DAILY_LIMITS.professional} requests/day</li>
        </ul>
        <p className="text-sm text-white/50">
          When exceeded, the API returns HTTP 429 with code <code>rate_limit_exceeded</code>.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Health check</h2>
        <p className="font-mono text-sm text-violet-light">GET {BASE}/api/v1/health</p>
        <p className="text-sm text-white/60">No authentication required.</p>
        <Code>{`{
  "success": true,
  "data": {
    "service": "zippr-ink-api",
    "version": "1.0.0",
    "status": "healthy"
  }
}`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Optimize image (upload)</h2>
        <p className="font-mono text-sm text-violet-light">POST {BASE}/api/v1/images/optimize</p>
        <p className="text-sm text-white/60">
          <code>multipart/form-data</code> — fields: <code>file</code> (required),{" "}
          <code>quality</code> (1–100), <code>format</code> (original, webp, avif, jpeg, png),{" "}
          <code>max_width</code>, <code>max_height</code>, <code>strip_metadata</code> (boolean).
          Max file size: 10 MB. Allowed types: JPEG, PNG, WebP, AVIF.
        </p>
        <Code>{`curl -X POST "${BASE}/api/v1/images/optimize" \\
  -H "Authorization: Bearer zippr_live_your_api_key" \\
  -F "file=@image.jpg" \\
  -F "quality=80" \\
  -F "format=webp" \\
  -F "max_width=1600"`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Optimize image (URL)</h2>
        <p className="font-mono text-sm text-violet-light">POST {BASE}/api/v1/images/optimize-url</p>
        <p className="text-sm text-white/60">
          JSON body with <code>image_url</code> and the same optional parameters as upload.
        </p>
        <Code>{`curl -X POST "${BASE}/api/v1/images/optimize-url" \\
  -H "Authorization: Bearer zippr_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/image.jpg",
    "quality": 80,
    "format": "webp",
    "max_width": 1600,
    "strip_metadata": true
  }'`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Get optimization job</h2>
        <p className="font-mono text-sm text-violet-light">
          GET {BASE}/api/v1/images/jobs/:job_id
        </p>
        <p className="text-sm text-white/60">
          Retrieve status and URLs for a previous optimization job.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Success response</h2>
        <Code>{`{
  "success": true,
  "data": {
    "job_id": "job_123",
    "original_url": "https://…",
    "optimized_url": "https://…",
    "original_size_bytes": 850000,
    "optimized_size_bytes": 210000,
    "compression_ratio": 75.29,
    "format": "webp",
    "width": 1600,
    "height": 900,
    "status": "completed"
  }
}`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Error format</h2>
        <Code>{`{
  "success": false,
  "error": {
    "code": "invalid_image_url",
    "message": "The provided image URL is invalid or unreachable.",
    "details": {}
  }
}`}</Code>
        <p className="text-sm text-white/60">
          Codes: <code>unauthorized</code>, <code>invalid_api_key</code>,{" "}
          <code>rate_limit_exceeded</code>, <code>invalid_file_type</code>,{" "}
          <code>file_too_large</code>, <code>invalid_image_url</code>,{" "}
          <code>optimization_failed</code>, <code>job_not_found</code>, <code>internal_error</code>.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">JavaScript</h2>
        <Code>{`const response = await fetch("${BASE}/api/v1/images/optimize-url", {
  method: "POST",
  headers: {
    "Authorization": "Bearer zippr_live_your_api_key",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    image_url: "https://example.com/image.jpg",
    quality: 80,
    format: "webp",
    max_width: 1600,
    strip_metadata: true
  })
});

const result = await response.json();
console.log(result.data.optimized_url);`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Node.js</h2>
        <Code>{`const fs = require("fs");
const form = new FormData();
form.append("file", new Blob([fs.readFileSync("image.jpg")]), "image.jpg");
form.append("quality", "80");
form.append("format", "webp");

const res = await fetch("${BASE}/api/v1/images/optimize", {
  method: "POST",
  headers: { Authorization: "Bearer zippr_live_your_api_key" },
  body: form
});
const json = await res.json();`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">PHP</h2>
        <Code>{`$ch = curl_init("${BASE}/api/v1/images/optimize-url");

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer zippr_live_your_api_key",
    "Content-Type: application/json"
]);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "image_url" => "https://example.com/image.jpg",
    "quality" => 80,
    "format" => "webp",
    "max_width" => 1600,
    "strip_metadata" => true
]));

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
echo $result["data"]["optimized_url"];`}</Code>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-semibold">Best practices</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-white/70">
          <li>Store API keys in environment variables, never in client-side code.</li>
          <li>Use <code>zippr_test_</code> keys while developing.</li>
          <li>Prefer WebP or AVIF for smaller file sizes on the web.</li>
          <li>Set <code>max_width</code> to match your layout (e.g. 1600 for full-width heroes).</li>
          <li>Handle 429 responses with backoff or queueing.</li>
          <li>Only use publicly reachable HTTPS image URLs for optimize-url.</li>
        </ul>
      </section>

      <p className="text-sm">
        <a href="/openapi.json" className="text-violet-light hover:underline">
          Download OpenAPI Specification
        </a>
      </p>
    </div>
  );
}
