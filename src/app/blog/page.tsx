import type { Metadata } from "next";

import { BlogPostGrid } from "@/components/blog-post-grid";
import { CampaignPlacement } from "@/components/campaign-placement";
import { PublicLink } from "@/components/navigation/public-link";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveCampaignsForPlacement } from "@/lib/public-campaigns";
import {
  getPublicBlogCategories,
  getPublishedBlogPosts,
} from "@/lib/public-content";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artigos e perspectivas da Nelled Studio sobre tecnologia, design, negócios e produtos digitais.",
};

type SearchParams = Promise<{
  categoria?: string | string[];
}>;

function selectedCategorySlug(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Blog({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categorySlug = selectedCategorySlug(params.categoria);
  const [posts, categories, campaigns] = await Promise.all([
    getPublishedBlogPosts(categorySlug || undefined),
    getPublicBlogCategories(),
    getActiveCampaignsForPlacement("blog-list"),
  ]);

  const categoryNavigation = categories.length > 0 ? (
    <nav className={styles.categoryNav} aria-label="Filtrar artigos por categoria">
      <PublicLink
        href="/blog"
        className={!categorySlug ? styles.categoryLinkActive : styles.categoryLink}
        aria-current={!categorySlug ? "page" : undefined}
      >
        Todos
      </PublicLink>

      {categories.map((category) => (
        <PublicLink
          href={`/blog?categoria=${encodeURIComponent(category.slug)}`}
          className={
            categorySlug === category.slug
              ? styles.categoryLinkActive
              : styles.categoryLink
          }
          aria-current={categorySlug === category.slug ? "page" : undefined}
          key={category.slug}
        >
          {category.name}
        </PublicLink>
      ))}
    </nav>
  ) : null;

  const postList = posts.length > 0 ? (
    <BlogPostGrid posts={posts} />
  ) : (
    <div className="empty-panel">
      <div className="empty-symbol">NS</div>

      <div>
        <h3>{categorySlug ? "Nenhum artigo nesta categoria" : "Artigos em breve"}</h3>
        <p>
          {categorySlug
            ? "Novos conteúdos desta categoria aparecerão aqui quando forem publicados."
            : "Os primeiros conteúdos serão publicados aqui."}
        </p>
      </div>
    </div>
  );

  const hero = (
    <>
      <PageHero
        eyebrow="BLOG"
        title="Ideias para produtos digitais melhores."
        description="Conteúdos sobre desenvolvimento, produto, tecnologia e experiências digitais."
      />
      {categoryNavigation}
    </>
  );

  return (
    <>
      <SiteHeader />

      <main className="inner-page">
        {campaigns.length > 0 ? (
          <div className={styles.pageLayout}>
            <div className={styles.mainColumn}>
              {hero}
              {postList}
            </div>

            <aside className={styles.sidebar} aria-label="Publicidade">
              <div className={styles.sidebarInner}>
                <CampaignPlacement placement="blog-list" campaigns={campaigns} />
              </div>
            </aside>
          </div>
        ) : (
          <>
            {hero}
            {postList}
          </>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
