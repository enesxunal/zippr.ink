import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/content/blog/posts";
import { SEO_LOCALES, languageAlternates, localizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const localizedPages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/tools/share", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/tools/compress", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/tools/convert", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/tools/pdf", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/enterprise", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  for (const locale of SEO_LOCALES) {
    for (const page of localizedPages) {
      entries.push({
        url: localizedUrl(locale, page.path),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages: languageAlternates(page.path) },
      });
    }
  }

  // Blog and FAQ data are currently authored in Turkish only.
  entries.push(
    {
      url: localizedUrl("tr", "/blog"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: localizedUrl("tr", "/sss"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // API docs are authored in English.
    {
      url: localizedUrl("en", "/api-docs"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }
  );

  for (const post of BLOG_POSTS) {
    entries.push({
      url: localizedUrl("tr", `/blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}
