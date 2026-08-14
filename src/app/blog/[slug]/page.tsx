import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getPublishedPost } from "@/lib/public-content";

import styles from "./page.module.css";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function sanitizeHtml(value: string) {
  return value
    .replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      "",
    )
    .replace(
      /\son\w+\s*=\s*(['"]).*?\1/gi,
      "",
    );
}

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
        coverImage?: string;
        coverAlt?: string;
      })
    : {};

const html = sanitizeHtml(content.html ?? "");
const coverAlt = content.coverAlt ?? "";

  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const readingTime = Math.max(
    1,
    Math.ceil(words / 200),
  );

  const category =
    "category" in data &&
    typeof data.category === "string"
      ? data.category
      : "Artigo";

  const publishedAt =
    "published_at" in data &&
    typeof data.published_at === "string"
      ? data.published_at
      : null;

  const coverImage =
    "cover_image" in data &&
    typeof data.cover_image === "string"
      ? data.cover_image
      : null;

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>
            {category} · {readingTime}{" "}
            {readingTime === 1
              ? "min de leitura"
              : "min de leitura"}
          </p>

          <h1>{data.title}</h1>

          {data.summary && (
            <p className={styles.lead}>
              {data.summary}
            </p>
          )}

          {publishedAt && (
            <time
              className={styles.date}
              dateTime={publishedAt}
            >
              {formatDate(publishedAt)}
            </time>
          )}
        </header>

        {coverImage && (
          <figure className={styles.cover}>
            <div className={styles.coverWrapper}>
              <Image
                src={coverImage}
                alt={coverAlt || data.title}
                fill
                sizes="(max-width: 768px) 100vw, 1000px"
                className={styles.cover}
                priority
              />
            </div>
          </figure>
        )}

        <article
          className={styles.article}
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />

        <section className={styles.cta}>
          <p className={styles.ctaEyebrow}>
            VAMOS CONVERSAR
          </p>

          <h2>
            Tem um projeto em mente?
          </h2>

          <p>
            Conte sua ideia e descubra como a
            Nelled Studio pode transformar seu
            desafio em produto digital.
          </p>

          <Link
            href="/contato"
            className="button primary"
          >
            Fale com a Nelled Studio
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}