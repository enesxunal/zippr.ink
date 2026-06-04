import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { BLOG_POSTS, getPost } from "@/content/blog/posts";
import { JsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | zippr.ink Blog`,
    description: post.description,
    alternates: { canonical: `https://zippr.ink/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "zippr.ink" },
    publisher: { "@type": "Organization", name: "zippr.ink" },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={articleSchema} />
      <Link href="/blog" className="text-sm text-violet-light hover:underline">
        ← Blog
      </Link>
      <p className="mt-4 text-xs text-white/40">
        {post.date} · {post.readMinutes} dk
      </p>
      <h1 className="mt-2 text-3xl font-bold">{post.title}</h1>
      <p className="mt-4 text-lg text-white/60">{post.description}</p>
      <div className="prose-invert mt-10 space-y-8">
        {post.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="mb-3 text-xl font-semibold text-white">{section.heading}</h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mb-4 leading-relaxed text-white/75">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
      <div className="mt-12 rounded-xl border border-violet/30 bg-violet/10 p-6 text-center">
        <p className="mb-4 text-white/80">Hemen deneyin — ücretsiz başlayın</p>
        <Link
          href="/tools/share"
          className="inline-block rounded-lg bg-violet px-6 py-2 font-medium text-white"
        >
          Dosya paylaş
        </Link>
      </div>
    </article>
  );
}
