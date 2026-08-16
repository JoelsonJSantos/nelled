import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostGrid } from "@/components/blog-post-grid";
import { PublicLink } from "@/components/navigation/public-link";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBlogCategory,
  getPublishedBlogPosts,
} from "@/lib/public-content";

import styles from "../../page.module.css";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicBlogCategory(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${category.name} | Blog`,
    description:
      category.description ||
      `Artigos da categoria ${category.name} no blog da Nelled Studio.`,
  };
}

export default async function BlogCategory({
  params,
}: Props) {
  const { slug } = await params;
  const [category, posts] = await Promise.all([
    getPublicBlogCategory(slug),
    getPublishedBlogPosts(slug),
  ]);

  if (!category) {
    notFound();
  }

  const postList = posts.length > 0 ? (
    <BlogPostGrid posts={posts} />
  ) : (
    <div className="empty-panel">
      <div className="empty-symbol">NS</div>
      <div>
        <h3>Artigos em breve</h3>
        <p>Novos conteúdos desta categoria aparecerão aqui quando forem publicados.</p>
      </div>
    </div>
  );

  const hero = (
    <>
      <PageHero
        eyebrow="BLOG · CATEGORIA"
        title={category.name}
        description={
          category.description ||
          `Conteúdos da Nelled Studio sobre ${category.name.toLocaleLowerCase("pt-BR")}.`
        }
      />
      <nav className={styles.categoryNav} aria-label="Navegação do blog">
        <PublicLink className={styles.categoryLink} href="/blog">
          Ver todos os artigos
        </PublicLink>
      </nav>
    </>
  );

  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        {hero}
        {postList}
      </main>
      <SiteFooter />
    </>
  );
}
