import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { PrivacyPreferencesButton } from "@/components/privacy/privacy-preferences-button";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import aboutStyles from "./about-page.module.css";
import legalStyles from "./legal-page.module.css";

import {
  getSiteSettings,
  phoneHref,
  replaceSiteTokens,
  type LegalPageContent,
} from "@/lib/site-settings";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

type LegalKey =
  | "termos-de-uso"
  | "politica-de-privacidade"
  | "politica-de-cookies";

function sanitizeHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(
      /\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi,
      ' $1="#"',
    );
}

function isLegalKey(value: string): value is LegalKey {
  return [
    "termos-de-uso",
    "politica-de-privacidade",
    "politica-de-cookies",
  ].includes(value);
}

function getLegalPage(
  key: LegalKey,
  pages: Awaited<ReturnType<typeof getSiteSettings>>["pages"],
): LegalPageContent {
  if (key === "termos-de-uso") return pages.termosDeUso;
  if (key === "politica-de-privacidade") return pages.politicaDePrivacidade;
  return pages.politicaDeCookies;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  const key = slug.join("/");

  if (isLegalKey(key)) {
    const page = getLegalPage(key, settings.pages);

    return {
      title: replaceSiteTokens(page.seoTitle, settings),
      description: replaceSiteTokens(page.seoDescription, settings),
      alternates: {
        canonical: `${settings.domain}/${key}`,
      },
      openGraph: {
        title: replaceSiteTokens(page.seoTitle, settings),
        description: replaceSiteTokens(page.seoDescription, settings),
        url: `${settings.domain}/${key}`,
        siteName: settings.companyName,
        type: "website",
      },
    };
  }

  if (key === "sobre") {
    return {
      title: "Sobre",
      description:
        "Conheça a Nelled Studio, sua forma de trabalhar e o propósito que orienta cada solução digital.".replaceAll(
          "Nelled Studio",
          settings.companyName,
        ),
    };
  }

  if (key === "contato") {
    return {
      title: "Contato",
      description:
        "Converse com a Nelled Studio sobre seu próximo site, sistema, plataforma ou produto digital.".replaceAll(
          "Nelled Studio",
          settings.companyName,
        ),
    };
  }

  return {
    title: "Página em construção",
    description: `Conteúdo institucional da ${settings.companyName} em preparação.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Page({ params }: Props) {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  const key = slug[0] ?? "";
  const isAbout = key === "sobre";
  const isContact = key === "contato";
  const isLegal = isLegalKey(key);

  const telephone = phoneHref(settings.phone);
  const hasDirectContact = Boolean(
    settings.email || settings.phone || settings.instagram || settings.linkedin,
  );

  const pageContent = isAbout
    ? {
        eyebrow: settings.pages.sobre.eyebrow,
        title: settings.pages.sobre.title,
        copy: settings.pages.sobre.description,
      }
    : isContact
      ? {
          eyebrow: settings.pages.contato.eyebrow,
          title: settings.pages.contato.title,
          copy: settings.pages.contato.description,
        }
      : isLegal
        ? (() => {
            const page = getLegalPage(key, settings.pages);
            return {
              eyebrow: replaceSiteTokens(page.eyebrow, settings),
              title: replaceSiteTokens(page.title, settings),
              copy: replaceSiteTokens(page.description, settings),
            };
          })()
        : {
            eyebrow: "NELLED STUDIO",
            title: "Página em construção.",
            copy: "Este conteúdo será administrado pelo CMS da Nelled Studio.",
          };

  const aboutParagraphs = settings.pages.sobre.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const directTitle =
    settings.pages.contato.directTitle || `Fale com a ${settings.companyName}`;

  const legalPage = isLegal ? getLegalPage(key, settings.pages) : null;
  const legalHtml = legalPage
    ? sanitizeHtml(replaceSiteTokens(legalPage.html, settings))
    : "";

  return (
    <>
      <SiteHeader />

      <main className={`inner-page ${isLegal ? legalStyles.page : ""}`}>
        <PageHero
          eyebrow={pageContent.eyebrow}
          title={pageContent.title}
          description={pageContent.copy}
          narrow={isContact || isLegal}
        />

        {isContact ? (
          <div className="contact-layout">
            <ContactForm />

            <aside className="contact-info-card" aria-label="Canais de contato">
              <div>
                <p className="eyebrow">{settings.pages.contato.directEyebrow}</p>
                <h2>{directTitle}</h2>
                <p>{settings.pages.contato.directDescription}</p>
              </div>

              {hasDirectContact ? (
                <div className="contact-info-links">
                  {settings.email && (
                    <a href={`mailto:${settings.email}`}>
                      <Mail size={17} />
                      <span>
                        <small>E-mail</small>
                        <strong>{settings.email}</strong>
                      </span>
                    </a>
                  )}

                  {settings.phone && telephone && (
                    <a href={telephone}>
                      <Phone size={17} />
                      <span>
                        <small>Telefone</small>
                        <strong>{settings.phone}</strong>
                      </span>
                    </a>
                  )}

                  {settings.instagram && (
                    <a
                      href={settings.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <InstagramIcon size={17} />
                      <span>
                        <small>Instagram</small>
                        <strong>Abrir perfil</strong>
                      </span>
                    </a>
                  )}

                  {settings.linkedin && (
                    <a
                      href={settings.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkedInIcon size={17} />
                      <span>
                        <small>LinkedIn</small>
                        <strong>Abrir perfil</strong>
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="contact-info-empty">
                  Os canais diretos serão exibidos aqui assim que forem configurados no
                  CMS.
                </p>
              )}
            </aside>
          </div>
        ) : isAbout ? (
          <section className={aboutStyles.story} aria-label="História da Nelled Studio">
            <div className={aboutStyles.storyLead}>
              <p className={aboutStyles.storyEyebrow}>DESDE JANEIRO DE 2026</p>
              <h2>Uma história que começou com vontade de construir melhor.</h2>
              <p>
                A {settings.companyName} nasceu para transformar experiência prática em
                tecnologia que resolve problemas reais — com clareza, cuidado e espaço
                para evoluir.
              </p>
            </div>

            <div className={aboutStyles.timeline}>
              <article className={aboutStyles.milestone}>
                <div className={aboutStyles.marker}>
                  <span>JAN</span>
                  <strong>2026</strong>
                </div>

                <div className={aboutStyles.milestoneContent}>
                  <p className={aboutStyles.label}>ORIGEM</p>
                  <h3>Nasce a {settings.companyName}.</h3>
                  <p>
                    Fundada em janeiro de 2026, a {settings.companyName} surgiu com uma
                    proposta simples: criar soluções digitais que não fossem apenas
                    bonitas, mas realmente úteis.
                  </p>
                  <p>
                    O estúdio nasceu da experiência prática com tecnologia, suporte,
                    infraestrutura e desenvolvimento, reunindo conhecimento técnico com
                    uma visão cada vez mais voltada à criação de produtos digitais.
                  </p>
                </div>
              </article>

              <article className={aboutStyles.milestone}>
                <div className={aboutStyles.marker}>
                  <span>NOSSO</span>
                  <strong>PORQUÊ</strong>
                </div>

                <div className={aboutStyles.milestoneContent}>
                  <p className={aboutStyles.label}>PROPÓSITO</p>
                  <h3>{settings.pages.sobre.bodyTitle}</h3>

                  {aboutParagraphs.map((paragraph, index) => (
                    <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                  ))}
                </div>
              </article>

              <article className={aboutStyles.milestone}>
                <div className={aboutStyles.marker}>
                  <span>AGORA</span>
                  <strong>HOJE</strong>
                </div>

                <div className={aboutStyles.milestoneContent}>
                  <p className={aboutStyles.label}>EVOLUÇÃO</p>
                  <h3>Construindo o próximo passo.</h3>
                  <p>
                    Hoje, a {settings.companyName} evolui como um estúdio digital
                    independente, desenvolvendo produtos próprios e criando soluções
                    personalizadas para empresas, profissionais e novos negócios.
                  </p>
                  <p>
                    Cada novo projeto amplia essa história: entender melhor o problema,
                    escolher a tecnologia certa e entregar algo que possa continuar
                    crescendo depois do lançamento.
                  </p>
                </div>
              </article>
            </div>

            <div className={aboutStyles.facts} aria-label="Nelled Studio em números">
              <div>
                <strong>JAN 2026</strong>
                <span>Fundação</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Foco em soluções digitais</span>
              </div>

              <div className={aboutStyles.factWide}>
                <strong>Estratégia · Design · Tecnologia</strong>
                <span>Do conceito à evolução</span>
              </div>
            </div>
          </section>
        ) : isLegal ? (
          <div className={legalStyles.shell}>
            <article
              className={legalStyles.content}
              dangerouslySetInnerHTML={{
                __html: legalHtml,
              }}
            />

            {(key === "politica-de-privacidade" ||
              key === "politica-de-cookies") && (
              <div className={legalStyles.preferences}>
                <PrivacyPreferencesButton
                  variant="inline"
                  label="Gerenciar preferências de privacidade"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="empty-panel page-panel">
            <div className="empty-symbol">NS</div>
            <div>
              <h3>Conteúdo gerenciado pelo CMS</h3>
              <p>Esta página está preparada para receber conteúdo institucional.</p>

              {key === "portfolio" && (
                <Link href="/contato" className="text-link">
                  Tem um projeto em mente? <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
