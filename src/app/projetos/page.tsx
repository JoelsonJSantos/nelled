import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CampaignPlacement } from "@/components/campaign-placement";
import { ProjectImage } from "@/components/project-image";
import { PublicLink } from "@/components/navigation/public-link";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getActiveCampaignsForPlacement } from "@/lib/public-campaigns";
import { getPublishedProjects } from "@/lib/public-content";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projetos",
  description: "Conheça os projetos e produtos digitais desenvolvidos pela Nelled Studio.",
};

export default async function Projects() {
  const [projects, campaigns] = await Promise.all([
    getPublishedProjects(),
    getActiveCampaignsForPlacement("portfolio-list"),
  ]);

  const projectList = projects.length ? (
    <div className={styles.grid}>
      {projects.map((project) => (
        <article className={styles.card} key={project.id}>
          <PublicLink href={`/projetos/${project.slug}`} className={styles.media} aria-label={`Ver projeto ${project.name}`}><ProjectImage src={project.coverImage} alt={`Capa do projeto ${project.name}`} sizes="(max-width: 760px) 100vw, 50vw" /></PublicLink>
          <div className={styles.cardBody}>
            <div className={styles.meta}><span>{project.category || "Projeto"}</span><span>{project.year}</span></div>
            <h2><PublicLink href={`/projetos/${project.slug}`}>{project.name}</PublicLink></h2>
            <p>{project.excerpt}</p>
            {project.technologies.length > 0 && <ul>{project.technologies.slice(0, 5).map((technology) => <li key={technology}>{technology}</li>)}</ul>}
            <PublicLink className={styles.link} href={`/projetos/${project.slug}`}>Ver projeto <ArrowRight size={16} /></PublicLink>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="empty-panel"><div className="empty-symbol">NS</div><div><h3>Cases em preparação</h3><p>Os projetos publicados pela Nelled Studio aparecerão aqui.</p></div></div>
  );

  return (
    <>
      <SiteHeader />
      <main className={`inner-page ${styles.page}`}>
        {campaigns.length > 0 ? (
          <div className={styles.pageLayout}>
            <div className={styles.mainColumn}>
              <PageHero eyebrow="PROJETOS" title="Projetos que criam movimento." description="Cases reais construídos com estratégia, tecnologia e atenção aos detalhes." />
              {projectList}
            </div>

            <aside className={styles.sidebar} aria-label="Publicidade">
              <div className={styles.sidebarInner}>
                <CampaignPlacement placement="portfolio-list" campaigns={campaigns} />
              </div>
            </aside>
          </div>
        ) : (
          <>
            <PageHero eyebrow="PROJETOS" title="Projetos que criam movimento." description="Cases reais construídos com estratégia, tecnologia e atenção aos detalhes." />
            {projectList}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
