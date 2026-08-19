import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";
import {
  ArrowRight,
  Blocks,
  Code2,
  Cpu,
  Layers3,
  Palette,
  ShieldCheck,
} from "lucide-react";

import { ProjectImage } from "@/components/project-image";
import { CampaignPlacement } from "@/components/campaign-placement";
import { PublicLink } from "@/components/navigation/public-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getFeaturedProjects } from "@/lib/public-content";
import { getSiteSettings } from "@/lib/site-settings";

import portfolioStyles from "./home-portfolio.module.css";
import endStyles from "./home-end.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: { absolute: settings.seoTitle },
    description: settings.seoDescription,
    alternates: { canonical: settings.domain },
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: settings.domain,
      siteName: settings.companyName,
      type: "website",
    },
  };
}

const services = [
  [
    Code2,
    "Desenvolvimento Web",
    "Sites institucionais, portais, aplicações e experiências web modernas.",
  ],
  [
    Blocks,
    "Sistemas personalizados",
    "Soluções sob medida para digitalizar processos e operações.",
  ],
  [
    Layers3,
    "Aplicações SaaS",
    "Plataformas escaláveis, seguras e prontas para evoluir.",
  ],
  [
    Palette,
    "UI/UX & Interfaces",
    "Interfaces intuitivas, acessíveis e pensadas para pessoas.",
  ],
  [
    Cpu,
    "Integrações",
    "APIs, pagamentos, autenticação, e-mails e serviços externos.",
  ],
  [
    ShieldCheck,
    "Suporte & evolução",
    "Manutenção e melhoria contínua de aplicações digitais.",
  ],
] as const;

function HeroEyebrow({ value }: { value: string }) {
  const parts = value
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return <p className="eyebrow">{value}</p>;
  }

  return (
    <p className="eyebrow">
      {parts.map((part, index) => (
        <Fragment key={`${part}-${index}`}>
          {index > 0 && <i />}
          {part}
        </Fragment>
      ))}
    </p>
  );
}

export default async function Home() {
  const [featuredProjects, settings] = await Promise.all([
    getFeaturedProjects(),
    getSiteSettings(),
  ]);

  const home = settings.pages.home;

  return (
    <>
      <SiteHeader />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <HeroEyebrow value={home.heroEyebrow} />

            <h1>
              {home.heroTitle} <span>{home.heroAccent}</span>
            </h1>

            <p className="lede">{home.heroDescription}</p>
            <p className="subtle">{home.heroSecondary}</p>

            <div className="actions">
              <PublicLink className="button primary" href="/projetos">
                {home.primaryCtaLabel}
                <ArrowRight size={17} />
              </PublicLink>

              <PublicLink className="button ghost" href="/contato">
                {home.secondaryCtaLabel}
              </PublicLink>
            </div>
          </div>

          <div className="ns-stage" aria-label="Símbolo Nelled Studio">
            <div className="orbit orbit-a" />
            <div className="orbit orbit-b" />

            <Image
              src="/nelled-studio-hero-dark.png"
              alt="Logo Nelled Studio"
              width={560}
              height={560}
              priority
              className="hero-logo hero-logo-dark"
            />

            <Image
              src="/nelled-studio-hero-light.png"
              alt=""
              aria-hidden="true"
              width={560}
              height={560}
              priority
              className="hero-logo hero-logo-light"
            />
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{home.servicesEyebrow}</p>
              <h2>{home.servicesTitle}</h2>
            </div>
          </div>

          <div className="service-grid">
            {services.map(([Icon, title, text]) => (
              <article className="service-card" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section showcase">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{home.portfolioEyebrow}</p>
              <h2>{home.portfolioTitle}</h2>
            </div>

            <PublicLink className="text-link" href="/projetos">
              {home.portfolioLinkLabel}
              <ArrowRight size={16} />
            </PublicLink>
          </div>

          {featuredProjects.length ? (
            <div className={portfolioStyles.grid}>
              {featuredProjects.map((project) => (
                <article className={portfolioStyles.card} key={project.id}>
                  <PublicLink
                    href={`/projetos/${project.slug}`}
                    className={portfolioStyles.media}
                  >
                    <ProjectImage
                      src={project.coverImage}
                      alt={`Capa do projeto ${project.name}`}
                      sizes="(max-width: 760px) 100vw, 33vw"
                    />
                  </PublicLink>

                  <div>
                    <p className="eyebrow">
                      {project.category || "PROJETO"} · {project.year}
                    </p>

                    <h3>
                      <PublicLink href={`/projetos/${project.slug}`}>
                        {project.name}
                      </PublicLink>
                    </h3>

                    <p>{project.excerpt}</p>

                    <PublicLink
                      href={`/projetos/${project.slug}`}
                      className={portfolioStyles.link}
                    >
                      Ver case
                      <ArrowRight size={15} />
                    </PublicLink>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <div className="empty-symbol">NS</div>
              <div>
                <h3>Projetos com contexto, não promessas.</h3>
                <p>Os cases publicados aqui serão projetos reais da Nelled Studio.</p>
              </div>
            </div>
          )}
        </section>

        <div className={endStyles.campaign}>
          <CampaignPlacement placement="home-showcase" />
        </div>

        <section className={`section cta ${endStyles.cta}`}>
          <p className="eyebrow">{home.ctaEyebrow}</p>
          <h2>{home.ctaTitle}</h2>
          <p>{home.ctaDescription}</p>

          <PublicLink className="button primary" href="/contato">
            {home.ctaButtonLabel}
            <ArrowRight size={17} />
          </PublicLink>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
