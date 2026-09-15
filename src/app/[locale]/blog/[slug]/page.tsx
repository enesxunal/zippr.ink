import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { BLOG_POSTS, getPost } from "@/content/blog/posts";
import { JsonLd } from "@/components/seo/json-ld";
import { createSeoMetadata, localizedUrl, normalizeLocale, SITE_URL } from "@/lib/seo";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const post = getPost(slug);
  if (!post) return {};

  const metadata = createSeoMetadata({
    locale,
    path: `/blog/${slug}`,
    title: `${post.title} | zippr.ink Blog`,
    description: post.description,
    noindex: locale !== "tr",
    type: "article",
    publishedTime: post.date,
  });

  return {
    ...metadata,
    keywords: post.keywords,
    authors: [{ name: "zippr.ink" }],
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const post = getPost(slug);
  if (!post) notFound();

  const articleUrl = localizedUrl("tr", `/blog/${slug}`);
  const related = BLOG_POSTS.filter(
    (p) => p.slug !== post.slug && post.cluster && p.cluster === post.cluster
  ).slice(0, 4);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated || post.date,
    inLanguage: "tr-TR",
    keywords: post.keywords?.join(", "),
    author: { "@type": "Organization", name: "zippr.ink", url: SITE_URL },
    publisher: { "@type": "Organization", name: "zippr.ink", url: SITE_URL },
    mainEntityOfPage: articleUrl,
    isPartOf: { "@type": "Blog", name: "zippr.ink Blog", url: localizedUrl("tr", "/blog") },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "zippr.ink", item: localizedUrl("tr", "") },
      { "@type": "ListItem", position: 2, name: "Blog", item: localizedUrl("tr", "/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  };

  const faqSchema = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
        <Link href="/" className="hover:text-violet-light">zippr.ink</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-violet-light">Blog</Link>
        <span>/</span>
        <span className="truncate text-white/60">{post.title}</span>
      </nav>

      <p className="text-xs text-white/40">
        {post.updated ? `Güncellendi: ${post.updated}` : post.date} · {post.readMinutes} dk okuma
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-5 text-lg leading-relaxed text-white/65">{post.description}</p>

      {post.keywords?.length ? (
        <div className="mt-5 flex flex-wrap gap-2" aria-label="Konu başlıkları">
          {post.keywords.slice(0, 6).map((keyword) => (
            <span key={keyword} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/50">
              {keyword}
            </span>
          ))}
        </div>
      ) : null}

      {post.sections.some((section) => section.heading) && (
        <aside className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <p className="mb-3 text-sm font-semibold text-white">Bu rehberde</p>
          <ol className="space-y-2 text-sm text-white/60">
            {post.sections.filter((section) => section.heading).map((section, i) => (
              <li key={section.heading}>
                <a href={`#bolum-${i + 1}`} className="hover:text-violet-light">
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </aside>
      )}

      <div className="prose-invert mt-10 space-y-10">
        {post.sections.map((section, i) => (
          <section key={i} id={section.heading ? `bolum-${post.sections.filter((s, idx) => idx <= i && s.heading).length}` : undefined}>
            {section.heading && (
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-white">{section.heading}</h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="mb-4 text-[1.02rem] leading-8 text-white/75">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      {post.faq?.length ? (
        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="text-2xl font-semibold">Sık sorulan sorular</h2>
          <div className="mt-6 space-y-4">
            {post.faq.map((item) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
                <h3 className="font-semibold text-white">{item.q}</h3>
                <p className="mt-2 leading-7 text-white/65">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 rounded-2xl border border-violet/30 bg-violet/10 p-6">
        <h2 className="text-xl font-semibold">Anlattığımız işlemi şimdi deneyin</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Rehberi okumakla kalmayın; ilgili zippr.ink aracını tarayıcıdan doğrudan kullanabilirsiniz.
        </p>
        <Link
          href={post.toolHref || "/tools/share"}
          className="mt-5 inline-block rounded-lg bg-violet px-6 py-2.5 font-medium text-white"
        >
          {post.toolLabel || "Dosya paylaş"}
        </Link>
      </section>

      {related.length > 0 && (
        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="text-2xl font-semibold">İlgili rehberler</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-violet/40"
              >
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {locale !== "tr" && (
        <p className="mt-10 text-center text-xs text-white/35">Bu rehberin ana içeriği Türkçe hazırlanmıştır.</p>
      )}
    </article>
  );
}
