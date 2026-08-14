import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos e perspectivas da Nelled Studio sobre tecnologia, design, negócios e produtos digitais.",
};

function formatDate(
  value: string | null,
) {
  if (!value) return "";

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default async function Blog() {
  const supabase =
    await createClient();

  if (!supabase) {
    throw new Error(
      "A conexão com o conteúdo não está disponível.",
    );
  }

  const { data, error } =
    await supabase
      .from("blog_posts")
      .select(`
        slug,
        title,
        summary,
        published_at,
        featured,
        content,
        seo,
        category_id
      `)
      .eq("status", "published")
      .lte(
        "published_at",
        new Date().toISOString(),
      )
      .order(
        "published_at",
        {
          ascending: false,
        },
      );

  if (error) {
    console.error(
      "Erro ao carregar artigos:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      },
    );

    throw new Error(
      "Não foi possível carregar os artigos.",
    );
  }

  const posts = data ?? [];

  return (
    <>
      <SiteHeader />

      <main className="inner-page">
        <PageHero
          eyebrow="BLOG"
          title="Ideias para produtos digitais melhores."
          description="Conteúdos sobre desenvolvimento, produto, tecnologia e experiências digitais."
        />

        {posts.length > 0 ? (
          <section
            className={styles.grid}
            aria-label="Artigos publicados"
          >
            {posts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                className={styles.card}
                key={post.slug}
                aria-label={`Ler artigo: ${post.title}`}
              >
                <div
                  className={styles.imagePlaceholder}
                  aria-hidden="true"
                >
                  NS
                </div>

                <div className={styles.content}>
                  <div className={styles.meta}>
                    <span>Artigo</span>

                    {post.featured && (
                      <>
                        <span>·</span>
                        <span>Destaque</span>
                      </>
                    )}
                  </div>

                  <h2 className={styles.title}>
                    {post.title}
                  </h2>

                  {post.summary && (
                    <p className={styles.summary}>
                      {post.summary}
                    </p>
                  )}

                  <div className={styles.footer}>
                    <time
                      dateTime={post.published_at ?? undefined}
                    >
                      {formatDate(post.published_at)}
                    </time>

                    <span className={styles.readMore}>
                      Ler artigo →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <div className="empty-panel">
            <div className="empty-symbol">
              NS
            </div>

            <div>
              <h3>
                Artigos em breve
              </h3>

              <p>
                Os primeiros conteúdos
                serão publicados aqui.
              </p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}