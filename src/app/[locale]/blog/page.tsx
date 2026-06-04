import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { BLOG_POSTS } from "@/content/blog/posts";

export const metadata: Metadata = {
  title: "Blog | zippr.ink",
  description:
    "Dosya paylaşımı, sıkıştırma, dönüştürme ve PDF ipuçları — zippr.ink blog.",
  alternates: { canonical: "https://zippr.ink/blog" },
};

export default async function BlogIndexPage() {
  const t = await getTranslations("content");
  const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-3 text-3xl font-bold">{t("blogTitle")}</h1>
      <p className="mb-10 text-white/60">{t("blogIntro")}</p>
      <div className="space-y-6">
        {sorted.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet/30"
          >
            <p className="text-xs text-white/40">
              {post.date} · {post.readMinutes} dk okuma
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:text-violet-light">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-white/60">{post.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-violet/20 px-2 py-0.5 text-xs text-violet-light"
                >
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
