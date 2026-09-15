import { BLOG_POSTS } from "@/content/blog/posts";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const items = [...BLOG_POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(url)}</link>`,
        `<guid isPermaLink=\"true\">${escapeXml(url)}</guid>`,
        `<description>${escapeXml(post.description)}</description>`,
        `<pubDate>${new Date(`${post.date}T12:00:00Z`).toUTCString()}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>zippr.ink Blog</title><link>${SITE_URL}/blog</link><description>PDF, dosya paylaşımı, görsel sıkıştırma ve format dönüştürme rehberleri.</description><language>tr-TR</language>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
