import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Code2, ExternalLink } from "lucide-react";
import { ProjectImage } from "@/components/project-image";
import { ProjectGallery } from "@/components/project-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { contentMetadata } from "@/lib/metadata";
import { getProjectNavigation, getPublishedProject } from "@/lib/public-content";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProject(slug);
  if (!project) return { title: "Projeto não encontrado", robots: { index: false, follow: false } };
  const metadata = contentMetadata(
    { title: project.seoTitle, description: project.seoDescription },
    project.name,
    project.excerpt || `Conheça o projeto ${project.name}, desenvolvido pela Nelled Studio.`,
  );
  return project.ogImage ? { ...metadata, openGraph: { images: [project.ogImage] } } : metadata;
}

function CaseSection({ eyebrow, title, content }: { eyebrow: string; title: string; content: string }) {
  if (!content) return null;
  return (
    <section className={styles.caseSection}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{content}</p>
    </section>
  );
}

export default async function Project({ params }: Props) {
  const { slug } = await params;
  const [project, navigation] = await Promise.all([getPublishedProject(slug), getProjectNavigation(slug)]);
  if (!project) notFound();

  const gallery = project.gallery.filter((image) => image !== project.coverImage);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="project-title">
          <div className={styles.heroCopy}>
            <p className="eyebrow">{project.category || "PROJETO"}</p>
            <h1 id="project-title">{project.name}</h1>
            <p className={styles.lede}>{project.excerpt}</p>
            <dl className={styles.facts}>
              {project.clientName && (
                <div>
                  <dt>Cliente</dt>
                  <dd>{project.clientName}</dd>
                </div>
              )}
              <div>
                <dt>Ano</dt>
                <dd>{project.year}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Publicado</dd>
              </div>
            </dl>
            {(project.externalUrl || project.githubUrl) && (
              <div className={styles.actions}>
                {project.externalUrl && (
                  <Link href={project.externalUrl} target="_blank" rel="noreferrer" className="button primary">
                    Visitar projeto <ExternalLink size={16} />
                  </Link>
                )}
                {project.githubUrl && (
                  <Link href={project.githubUrl} target="_blank" rel="noreferrer" className="button ghost">
                    <Code2 size={16} /> GitHub
                  </Link>
                )}
              </div>
            )}
          </div>
          <ProjectImage
            src={project.coverImage}
            alt={`Imagem principal do projeto ${project.name}`}
            priority
            sizes="(max-width: 880px) 100vw, 52vw"
            className={styles.cover}
          />
        </section>

        <div className={styles.content}>
          <div className={styles.overview}>
            <CaseSection eyebrow="VISÃO GERAL" title="O projeto" content={project.description} />
            {project.technologies.length > 0 && (
              <section className={styles.tech} aria-labelledby="technologies-title">
                <p className="eyebrow" id="technologies-title">TECNOLOGIAS</p>
                <ul>
                  {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </section>
            )}
          </div>

          <div className={styles.twoColumns}>
            <CaseSection eyebrow="DESAFIO" title="O problema" content={project.problem} />
            <CaseSection eyebrow="SOLUÇÃO" title="Como resolvemos" content={project.solution} />
          </div>

          <CaseSection eyebrow="PROCESSO" title="Da estratégia à entrega" content={project.process} />
          <CaseSection eyebrow="RESULTADOS" title="Impacto gerado" content={project.results} />

          <ProjectGallery images={gallery} projectName={project.name} />
        </div>

        <nav className={styles.projectNav} aria-label="Navegação entre projetos">
          {navigation.previous ? (
            <Link href={`/portfolio/${navigation.previous.slug}`}>
              <ArrowLeft size={17} />
              <span><small>Projeto anterior</small>{navigation.previous.name}</span>
            </Link>
          ) : <span />}
          {navigation.next ? (
            <Link href={`/portfolio/${navigation.next.slug}`}>
              <span><small>Próximo projeto</small>{navigation.next.name}</span>
              <ArrowRight size={17} />
            </Link>
          ) : <span />}
        </nav>

        <section className={styles.cta}>
          <p className="eyebrow">PRÓXIMO PROJETO</p>
          <h2>Vamos construir algo relevante?</h2>
          <p>Conte seu desafio e descubra como a Nelled Studio pode transformar sua ideia em um produto digital.</p>
          <Link href="/contato" className="button primary">
            Fale com a Nelled Studio <ArrowRight size={17} />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
