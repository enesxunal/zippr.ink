import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/content/blog/posts";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://zippr.ink";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/tools/share",
    "/tools/compress",
    "/tools/convert",
    "/tools/pdf",
    "/pricing",
    "/enterprise",
    "/login",
    "/register",
    "/blog",
    "/sss",
  ];

  const entries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/sss" || path === "/blog" ? 0.9 : 0.7,
  }));

  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
