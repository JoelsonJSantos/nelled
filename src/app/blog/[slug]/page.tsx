import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleShareButton } from "@/components/article-share-button";
import { CampaignPlacement } from "@/components/campaign-placement";
import { PublicLink } from "@/components/navigation/public-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import {
  getPublishedPost,
  normalizeBlogCategory,
} from "@/lib/public-content";
import { sanitizeRichTextHtml } from "@/lib/sanitize-rich-text";

import styles from "./page.module.css";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const post = await getPublishedPost(slug);

  if (!post) {
    return {
      title: "Artigo não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return contentMetadata(
    post.seo,
    post.title,
    post.summary ||
      `Leia ${post.title} no blog da Nelled Studio.`,
  );
}

export default async function Article({
  params,
}: Props) {
  const { slug } = await params;

  const data = await getPublishedPost(slug);

  if (!data) {
    notFound();
  }

  const content =
    typeof data.content === "object" && data.content
      ? (data.content as {
          html?: string;
        })
      : {};

  const html = sanitizeRichTextHtml(
    content.html ?? "",
  );

  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const readingTime = Math.max(
    1,
    Math.ceil(words / 200),
  );

  const category = normalizeBlogCategory(
    data.category,
  );

  const publishedAt =
    "published_at" in data &&
    typeof data.published_at === "string"
      ? data.published_at
      : null;

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            ARTIGO
          </p>

          <h1>{data.title}</h1>

          {data.summary && (
            <p className={styles.lead}>
              {data.summary}
            </p>
          )}

          <div className={styles.meta}>
            {publishedAt && (
              <time dateTime={publishedAt}>
                {formatDate(publishedAt)}
              </time>
            )}

            {publishedAt && category && (
              <span
                className={
                  styles.metaSeparator
                }
                aria-hidden="true"
              >
                ·
              </span>
            )}

            {category && (
              <PublicLink
                className={
                  styles.metaCategory
                }
                href={`/blog/categoria/${category.slug}`}
              >
                {category.name}
              </PublicLink>
            )}

            {(publishedAt || category) && (
              <span
                className={
                  styles.metaSeparator
                }
                aria-hidden="true"
              >
                ·
              </span>
            )}

            <span>
              {readingTime}{" "}
              {readingTime === 1
                ? "min de leitura"
                : "min de leitura"}
            </span>
          </div>
        </header>

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />

        <section
          className={styles.share}
          aria-label="Compartilhar artigo"
        >
          <div className={styles.shareContent}>
            <p
              className={
                styles.shareEyebrow
              }
            >
              COMPARTILHE
            </p>

            <h2>
              Gostou deste artigo?
            </h2>

            <p>
              Compartilhe este conteúdo com
              quem também pode se interessar
              pelo assunto.
            </p>
          </div>

          <ArticleShareButton
            title={data.title}
            className={styles.shareButton}
          />
        </section>

        <CampaignPlacement placement="blog-post-end" />

      </main>

      <SiteFooter />
    </>
  );
}