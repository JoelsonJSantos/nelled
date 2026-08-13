import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getPublishedPost } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }> };

function sanitizeHtml(value: string) {
  return value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Artigo não encontrado", robots: { index: false, follow: false } };
  return contentMetadata(
    post.seo,
    post.title,
    post.summary || `Leia ${post.title} no blog da Nelled Studio.`,
  );
}

export default async function Article({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedPost(slug);
  if (!data) notFound();
  const content = typeof data.content === "object" && data.content ? data.content as { html?: string } : {};
  const html = sanitizeHtml(content.html ?? "");
  const words = html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

  return <><SiteHeader/><main className="inner-page"><p className="eyebrow">ARTIGO · {Math.max(1, Math.ceil(words / 200))} MIN DE LEITURA</p><h1>{data.title}</h1><p className="lede">{data.summary}</p><article className="article-content" dangerouslySetInnerHTML={{ __html: html }} /></main><SiteFooter/></>;
}
