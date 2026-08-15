import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact-form";
import { InstagramIcon, LinkedInIcon } from "@/components/social-icons";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteSettings, phoneHref } from "@/lib/site-settings";

type Props = { params: Promise<{ slug: string[] }> };

const routeMetadata: Record<string, { title: string; description: string }> = {
  sobre: {
    title: "Sobre",
    description:
      "Conheça a Nelled Studio, sua forma de trabalhar e o propósito que orienta cada solução digital.",
  },
  contato: {
    title: "Contato",
    description:
      "Converse com a Nelled Studio sobre seu próximo site, sistema, plataforma ou produto digital.",
  },
  "termos-de-uso": {
    title: "Termos de Uso",
    description:
      "Consulte os termos e condições de uso do site e dos serviços digitais da Nelled Studio.",
  },
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    description:
      "Entenda como a Nelled Studio coleta, utiliza e protege os dados pessoais dos visitantes do site.",
  },
  "politica-de-cookies": {
    title: "Política de Cookies",
    description:
      "Saiba como a Nelled Studio utiliza cookies e tecnologias semelhantes em seu site.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  const pageMetadata = routeMetadata[slug.join("/")];

  if (pageMetadata) {
    return {
      title: pageMetadata.title,
      description: pageMetadata.description.replaceAll(
        "Nelled Studio",
        settings.companyName,
      ),
    };
  }

  return {
    title: "Página em construção",
    description: `Conteúdo institucional da ${settings.companyName} em preparação.`,
    robots: { index: false, follow: false },
  };
}

const content: Record<string, { eyebrow: string; title: string; copy: string }> = {
  sobre: {
    eyebrow: "NOSSA ESSÊNCIA",
    title: "Tecnologia que avança com clareza.",
    copy: "Somos um estúdio digital dedicado a transformar desafios de negócio em produtos digitais úteis, sofisticados e sustentáveis.",
  },
  portfolio: {
    eyebrow: "TRABALHOS",
    title: "Projetos que merecem ser bem contados.",
    copy: "Nosso portfólio será formado exclusivamente por cases reais. Em breve, a Nelled Field fará parte desta jornada.",
  },
  blog: {
    eyebrow: "CONHECIMENTO",
    title: "Ideias para produtos digitais melhores.",
    copy: "Artigos, aprendizados e perspectivas sobre tecnologia, design e negócios digitais serão publicados aqui.",
  },
  parceiros: {
    eyebrow: "ECOSSISTEMA",
    title: "Parcerias com intenção.",
    copy: "Recomendamos apenas ferramentas e empresas que possam gerar valor concreto para projetos digitais.",
  },
  contato: {
    eyebrow: "NOVOS PROJETOS",
    title: "Vamos criar algo juntos?",
    copy: "Conte um pouco sobre a sua ideia. Nossa equipe retornará pelo canal informado.",
  },
};

export default async function Page({ params }: Props) {
  const [{ slug }, settings] = await Promise.all([params, getSiteSettings()]);
  const key = slug[0];
  const pageContent = content[key] ?? {
    eyebrow: "NELLED STUDIO",
    title: "Página em construção.",
    copy: "Este conteúdo será administrado pelo CMS da Nelled Studio.",
  };
  const isContact = key === "contato";
  const telephone = phoneHref(settings.phone);
  const hasDirectContact = Boolean(
    settings.email || settings.phone || settings.instagram || settings.linkedin,
  );

  return (
    <>
      <SiteHeader />

      <main className="inner-page">
        <PageHero
          eyebrow={pageContent.eyebrow}
          title={pageContent.title}
          description={pageContent.copy}
          narrow={isContact}
        />

        {isContact ? (
          <div className="contact-layout">
            <ContactForm />

            <aside className="contact-info-card" aria-label="Canais de contato">
              <div>
                <p className="eyebrow">CONTATO DIRETO</p>
                <h2>Fale com a {settings.companyName}</h2>
                <p>
                  Prefere conversar por outro canal? Use um dos contatos oficiais abaixo.
                </p>
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
                  Os canais diretos serão exibidos aqui assim que forem configurados no CMS.
                </p>
              )}
            </aside>
          </div>
        ) : (
          <div className="empty-panel page-panel">
            <div className="empty-symbol">NS</div>
            <div>
              <h3>Conteúdo gerenciado pelo CMS</h3>
              <p>
                Esta área está preparada para receber {key === "portfolio" ? "projetos" : "conteúdos"} publicados no painel administrativo.
              </p>

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
