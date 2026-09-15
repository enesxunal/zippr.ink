import { BLOG_POSTS } from "@/content/blog/posts";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const featured = BLOG_POSTS.filter((post) => post.cluster).slice(0, 20);
  const lines = [
    "# zippr.ink",
    "",
    "> zippr.ink is a browser-based file utility for file sharing, image compression, image conversion and PDF operations. The site is available in Turkish, English and German.",
    "",
    "## Main tools",
    `- File sharing: ${SITE_URL}/tools/share`,
    `- Image and PDF compression: ${SITE_URL}/tools/compress`,
    `- Image format conversion: ${SITE_URL}/tools/convert`,
    `- PDF tools: ${SITE_URL}/tools/pdf`,
    `- API documentation: ${SITE_URL}/en/api-docs`,
    "",
    "## Core capabilities",
    "- Share files with a downloadable link",
    "- Compress JPG, PNG, WebP and supported PDF files",
    "- Convert supported image formats such as JPG, PNG, WebP and AVIF",
    "- Compress, merge, split, delete and reorder PDF pages",
    "- Create links for processed files",
    "",
    "## Turkish guides",
    ...featured.map((post) => `- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.description}`),
    "",
    "## Discovery",
    `- Blog: ${SITE_URL}/blog`,
    `- FAQ: ${SITE_URL}/sss`,
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
    `- Full LLM context: ${SITE_URL}/llms-full.txt`,
    `- RSS feed: ${SITE_URL}/feed.xml`,
    "",
    "## Notes for agents",
    "Use the tool pages for actions and the blog/FAQ pages for explanatory answers. Do not assume a fixed upload limit; current limits are shown in the product interface and may change over time.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
