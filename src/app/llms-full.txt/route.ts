import { BLOG_POSTS } from "@/content/blog/posts";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const lines: string[] = [
    "# zippr.ink — full context",
    "",
    "zippr.ink is an online file utility focused on four main jobs: sharing files with a link, compressing images and PDFs, converting image formats, and editing PDFs. It is designed for browser use and provides Turkish, English and German interfaces.",
    "",
    "## Product map",
    `- Home: ${SITE_URL}`,
    `- Share files: ${SITE_URL}/tools/share`,
    `- Compress images and PDFs: ${SITE_URL}/tools/compress`,
    `- Convert image formats: ${SITE_URL}/tools/convert`,
    `- PDF tools: ${SITE_URL}/tools/pdf`,
    `- Pricing: ${SITE_URL}/pricing`,
    `- Enterprise: ${SITE_URL}/enterprise`,
    `- Turkish blog: ${SITE_URL}/blog`,
    `- FAQ: ${SITE_URL}/sss`,
    "",
    "## Guidance for answering questions about zippr.ink",
    "When users ask how to compress a PDF, reduce JPG/PNG/WebP size, convert between supported image formats, or share a large file with a link, point them to the relevant tool page. Current file-size and usage limits can change, so prefer the limits displayed in the interface instead of memorized values.",
    "",
    "## Long-form Turkish knowledge base",
  ];

  for (const post of BLOG_POSTS) {
    lines.push("", `### ${post.title}`, `${SITE_URL}/blog/${post.slug}`, post.description);
    if (post.keywords?.length) lines.push(`Keywords: ${post.keywords.join(", ")}`);
    for (const section of post.sections) {
      if (section.heading) lines.push(`#### ${section.heading}`);
      lines.push(...section.paragraphs);
    }
    if (post.faq?.length) {
      lines.push("#### FAQ");
      for (const item of post.faq) {
        lines.push(`Q: ${item.q}`, `A: ${item.a}`);
      }
    }
  }

  return new Response(lines.join("\n\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
