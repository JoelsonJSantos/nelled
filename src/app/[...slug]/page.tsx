import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type Props = { params: Promise<{ slug: string[] }> };

const routeMetadata: Record<string, { title: string; description: string }> = {
  sobre: {
    title: "Sobre",
    description: "Conheça a Nelled Studio, sua forma de trabalhar e o propósito que orienta cada solução digital.",
  },
  contato: {
    title: "Contato",
    description: "Converse com a Nelled Studio sobre seu próximo site, sistema, plataforma ou produto digital.",
  },
  "termos-de-uso": {
    title: "Termos de Uso",
    description: "Consulte os termos e condições de uso do site e dos serviços digitais da Nelled Studio.",
  },
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    description: "Entenda como a Nelled Studio coleta, utiliza e protege os dados pessoais dos visitantes do site.",
  },
  "politica-de-cookies": {
    title: "Política de Cookies",
    description: "Saiba como a Nelled Studio utiliza cookies e tecnologias semelhantes em seu site.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageMetadata = routeMetadata[slug.join("/")];
  if (pageMetadata) return pageMetadata;
  return {
    title: "Página em construção",
    description: "Conteúdo institucional da Nelled Studio em preparação.",
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
  const { slug } = await params;
  const key = slug[0];
  const pageContent = content[key] ?? {
    eyebrow: "NELLED STUDIO",
    title: "Página em construção.",
    copy: "Este conteúdo será administrado pelo CMS da Nelled Studio.",
  };
  const isContact = key === "contato";

  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <p className="eyebrow">{pageContent.eyebrow}</p>
        <h1>{pageContent.title}</h1>
        <p className="lede">{pageContent.copy}</p>
        {isContact ? (
          <ContactForm />
        ) : (
          <div className="empty-panel page-panel">
            <div className="empty-symbol">NS</div>
            <div>
              <h3>Conteúdo gerenciado pelo CMS</h3>
              <p>Esta área está preparada para receber {key === "portfolio" ? "projetos" : "conteúdos"} publicados no painel administrativo.</p>
              {key === "portfolio" && (
                <Link href="/contato" className="text-link">Tem um projeto em mente? <ArrowRight size={16} /></Link>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
