import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getBlogArticleByHandle, getBlogArticles } from "@/lib/shopify";

interface Props {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const article = await getBlogArticleByHandle("journal", handle);

  if (!article) {
    return {
      title: "Article Not Found | Colin Guest",
    };
  }

  const title = article.seo?.title || `${article.title} | Colin Guest`;
  const description =
    article.seo?.description ||
    article.excerpt ||
    "Explore the latest editorial dispatch from Colin Guest.";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `https://www.colinguest.com/blog/${article.handle}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      url: `https://www.colinguest.com/blog/${article.handle}`,
      images: article.image?.url
        ? [
            {
              url: article.image.url,
              alt: article.image.altText || article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.image?.url ? [article.image.url] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const blog = await getBlogArticles("journal", 50);
    return (blog?.articles || []).map((article: any) => ({
      handle: article.handle,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { handle } = await params;
  const article = await getBlogArticleByHandle("journal", handle);

  if (!article) {
    notFound();
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Article JSON-LD Schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.seo?.description || article.excerpt || article.title,
    image: article.image?.url ? [article.image.url] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: {
      "@type": "Person",
      name: article.authorV2?.name || "Colin Guest",
    },
    publisher: {
      "@type": "Organization",
      name: "Colin Guest",
      logo: {
        "@type": "ImageObject",
        url: "https://www.colinguest.com/logo_cg.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.colinguest.com/blog/${article.handle}`,
    },
  };

  // Breadcrumb Schema
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.colinguest.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Journal",
        item: "https://www.colinguest.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://www.colinguest.com/blog/${article.handle}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <article className="min-h-screen bg-white text-black pt-28 md:pt-36 pb-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-14">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={1.5} />
              <span>Back to Journal</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-14 text-center max-w-3xl mx-auto space-y-4">
            {/* Exactly one H1 for this page */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif italic text-neutral-900 leading-[1.15] tracking-tight">
              {article.title}
            </h1>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 bg-neutral-100 rounded-full text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Featured Image */}
          {article.image?.url && (
            <div className="relative aspect-[16/10] md:aspect-[21/9] w-full rounded-2xl overflow-hidden mb-16 bg-neutral-100 shadow-sm">
              <Image
                src={article.image.url}
                alt={article.image.altText || `${article.title} - Colin Guest`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1100px"
              />
            </div>
          )}

          {/* Article Content - Editorial Luxury Typography */}
          <div
            className="text-neutral-700 font-sans text-base md:text-lg leading-[2.0] tracking-normal
              [&_p]:mb-8 
              [&_h2]:text-2xl [&_h2]:md:text-4xl [&_h2]:font-serif [&_h2]:italic [&_h2]:text-black [&_h2]:tracking-tight [&_h2]:mt-16 [&_h2]:mb-6 
              [&_h3]:text-xs [&_h3]:md:text-sm [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.25em] [&_h3]:text-black [&_h3]:mt-12 [&_h3]:mb-4 
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol]:space-y-3
              [&_li]:text-neutral-700 [&_li]:leading-[1.9]
              [&_blockquote]:border-l-2 [&_blockquote]:border-black/30 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:my-12 [&_blockquote]:text-neutral-900 [&_blockquote]:font-serif [&_blockquote]:text-xl
              [&_img]:rounded-2xl [&_img]:my-12 [&_img]:w-full [&_img]:shadow-sm
              [&_strong]:font-semibold [&_strong]:text-black
              [&_b]:font-semibold [&_b]:text-black
              [&_mark]:bg-neutral-100 [&_mark]:text-black [&_mark]:px-2 [&_mark]:py-0.5 [&_mark]:rounded-sm
              [&_a]:cursor-pointer [&_a]:text-neutral-500 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-[5px] [&_a]:decoration-neutral-400/70 [&_a]:decoration-[1.5px] [&_a:hover]:text-black [&_a:hover]:decoration-black [&_a:hover]:font-semibold [&_a]:transition-colors [&_a]:duration-200"
            dangerouslySetInnerHTML={{
              __html: article.contentHtml || article.content || "",
            }}
          />

          {/* Footer Navigation */}
          <div className="mt-20 pt-10 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-6">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.2em] uppercase text-black/40 hover:text-black transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1" strokeWidth={1.5} />
              <span>More Articles</span>
            </Link>

            <Link
              href="/collections/all"
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-neutral-800 active:scale-95 transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.18)]"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
