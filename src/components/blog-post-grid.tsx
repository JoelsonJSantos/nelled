import Image from "next/image";

import { PublicLink } from "@/components/navigation/public-link";
import type { PublishedBlogPost } from "@/lib/public-content";
import { isSupportedMediaUrl } from "@/lib/portfolio";

import styles from "./blog-post-grid.module.css";

function formatDate(value: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getCover(content: unknown) {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }

  const src = Reflect.get(content, "coverImage");
  const alt = Reflect.get(content, "coverAlt");

  if (typeof src !== "string" || !src || !isSupportedMediaUrl(src)) {
    return null;
  }

  return {
    src,
    alt: typeof alt === "string" ? alt : "",
  };
}

export function BlogPostGrid({
  posts,
}: {
  posts: PublishedBlogPost[];
}) {
  return (
    <section className={styles.grid} aria-label="Artigos publicados">
      {posts.map((post) => {
        const cover = getCover(post.content);
        const showMeta = post.category || post.featured;

        return (
          <PublicLink
            href={`/blog/${post.slug}`}
            className={styles.card}
            key={post.slug}
            aria-label={`Ler artigo: ${post.title}`}
          >
            {cover ? (
              <div className={styles.image}>
                <Image
                  src={cover.src}
                  alt={cover.alt || post.title}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 820px) 50vw, 33vw"
                  unoptimized={cover.src.startsWith("https://")}
                />
              </div>
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden="true">
                NS
              </div>
            )}

            <div className={styles.content}>
              {showMeta && (
                <div className={styles.meta}>
                  {post.category && <span>{post.category.name}</span>}

                  {post.category && post.featured && <span>·</span>}

                  {post.featured && <span>Destaque</span>}
                </div>
              )}

              <h2 className={styles.title}>{post.title}</h2>

              {post.summary && <p className={styles.summary}>{post.summary}</p>}

              <div className={styles.footer}>
                <time dateTime={post.publishedAt ?? undefined}>
                  {formatDate(post.publishedAt)}
                </time>

                <span className={styles.readMore}>Ler artigo →</span>
              </div>
            </div>
          </PublicLink>
        );
      })}
    </section>
  );
}
