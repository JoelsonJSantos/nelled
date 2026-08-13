import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getPublishedProject } from "@/lib/public-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return { title: "Projeto não encontrado", robots: { index: false, follow: false } };
  return contentMetadata(
    project.seo,
    project.name,
    project.excerpt || `Conheça o projeto ${project.name}, desenvolvido pela Nelled Studio.`,
  );
}

export default async function Project({ params }: Props) {
  const { slug } = await params;
  const data = await getPublishedProject(slug);
  if (!data) notFound();
  const content = typeof data.content === "object" && data.content ? data.content as { body?: string } : {};
  const body = content.body ?? "";
  const technologies = data.technologies ?? [];

  return <><SiteHeader/><main className="inner-page"><p className="eyebrow">{data.category || "PROJETO"}</p><h1>{data.name}</h1><p className="lede">{data.excerpt}</p><article className="article-content"><p>{body}</p><p className="eyebrow">TECNOLOGIAS</p><p>{technologies.join(" · ")}</p></article></main><SiteFooter/></>;
}
