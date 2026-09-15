import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { BLOG_POSTS } from "@/content/blog/posts";
import { createSeoMetadata, normalizeLocale } from "@/lib/seo";

const CLUSTERS = [
  { key: "pdf", label: "PDF işlemleri", description: "PDF sıkıştırma, birleştirme, bölme ve düzenleme rehberleri." },
  { key: "share", label: "Dosya gönderme ve paylaşma", description: "Büyük dosya gönderme, link ile paylaşma ve ücretsiz dosya transferi." },
  { key: "compress", label: "Görsel sıkıştırma", description: "JPG, PNG ve WebP dosya boyutunu küçültme ve web optimizasyonu." },
  { key: "convert", label: "Format dönüştürme", description: "JPG, PNG, WebP ve diğer görsel formatları arasında dönüşüm rehberleri." },
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  return createSeoMetadata({
    locale,
    path: "/blog",
    title: "PDF, Dosya Gönderme ve Görsel Dönüştürme Rehberleri | zippr.ink Blog",
    description: "PDF sıkıştırma, ücretsiz dosya gönderme, JPG-PNG-WebP dönüştürme ve görsel küçültme için kapsamlı, güncel ve uygulamalı rehberler.",
    noindex: locale !== "tr",
  });
}

export default function BlogIndexPage() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-violet-light">zippr.ink bilgi merkezi</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">PDF, dosya paylaşımı ve görsel araçları için kapsamlı rehberler</h1>
        <p className="mt-5 text-lg leading-8 text-white/60">
          İnsanların gerçekten aradığı sorulara doğrudan cevap veren; PDF sıkıştırma, ücretsiz dosya gönderme,
          JPG-PNG-WebP dönüştürme, görsel küçültme ve web optimizasyonunu adım adım anlatan içerikler.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Blog konu kümeleri">
        {CLUSTERS.map((cluster) => {
          const count = BLOG_POSTS.filter((post) => post.cluster === cluster.key).length;
          return (
            <a key={cluster.key} href={`#${cluster.key}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-violet/40">
              <p className="font-semibold text-white">{cluster.label}</p>
              <p className="mt-2 text-sm leading-6 text-white/50">{cluster.description}</p>
              <p className="mt-4 text-xs text-violet-light">{count} rehber</p>
            </a>
          );
        })}
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Yeni ve güncellenen rehberler</h2>
            <p className="mt-2 text-sm text-white/50">En son eklenen kapsamlı içerikler.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {sorted.slice(0, 8).map((post) => (
            <article key={post.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-violet/30">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/40">
                <span>{post.updated || post.date}</span>
                <span>·</span>
                <span>{post.readMinutes} dk okuma</span>
                {post.cluster && <span className="rounded-full bg-violet/15 px-2 py-0.5 text-violet-light">{CLUSTERS.find((c) => c.key === post.cluster)?.label || post.cluster}</span>}
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-snug">
                <Link href={`/blog/${post.slug}`} className="hover:text-violet-light">{post.title}</Link>
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/60">{post.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {CLUSTERS.map((cluster) => {
        const posts = sorted.filter((post) => post.cluster === cluster.key);
        if (!posts.length) return null;
        return (
          <section key={cluster.key} id={cluster.key} className="mt-16 scroll-mt-24 border-t border-white/10 pt-10">
            <h2 className="text-2xl font-semibold">{cluster.label}</h2>
            <p className="mt-2 text-white/55">{cluster.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article key={post.slug} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                  <p className="text-xs text-white/35">{post.readMinutes} dk okuma</p>
                  <h3 className="mt-2 font-semibold leading-snug text-white">
                    <Link href={`/blog/${post.slug}`} className="hover:text-violet-light">{post.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/50">{post.description}</p>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-16 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-semibold">Diğer zippr.ink rehberleri</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {sorted.filter((post) => !post.cluster).map((post) => (
            <article key={post.slug} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <h3 className="font-semibold text-white"><Link href={`/blog/${post.slug}`} className="hover:text-violet-light">{post.title}</Link></h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{post.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
