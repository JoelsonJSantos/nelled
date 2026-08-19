import type { Metadata } from "next";
import {
  Blocks,
  Code2,
  Cpu,
  Gauge,
  Layers3,
  Palette,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Serviços",
  description:
    "Conheça os serviços da Nelled Studio em desenvolvimento web, sistemas personalizados, SaaS, UI/UX, integrações, performance e evolução de produtos digitais.",
};

const services = [
  {
    icon: Code2,
    title: "Desenvolvimento Web",
    description:
      "Sites institucionais, portais, landing pages e aplicações web modernas, responsivas e preparadas para evoluir.",
    items: ["Sites e portais", "Landing pages", "Aplicações web"],
  },
  {
    icon: Blocks,
    title: "Sistemas personalizados",
    description:
      "Soluções sob medida para digitalizar processos, centralizar operações e atender necessidades específicas do negócio.",
    items: ["Painéis administrativos", "Fluxos internos", "Sistemas de gestão"],
  },
  {
    icon: Layers3,
    title: "Aplicações SaaS",
    description:
      "Produtos digitais escaláveis com arquitetura preparada para autenticação, planos, dados e crescimento contínuo.",
    items: ["MVPs", "Plataformas SaaS", "Produtos digitais"],
  },
  {
    icon: Palette,
    title: "UI/UX & Interfaces",
    description:
      "Interfaces claras e consistentes, pensadas para facilitar o uso e reforçar a identidade da experiência digital.",
    items: ["UI responsiva", "Experiência do usuário", "Design de interfaces"],
  },
  {
    icon: Cpu,
    title: "APIs & Integrações",
    description:
      "Conexões entre serviços, plataformas e sistemas para reduzir tarefas manuais e criar operações mais integradas.",
    items: ["APIs REST", "Pagamentos", "Autenticação e serviços externos"],
  },
  {
    icon: Gauge,
    title: "Performance & SEO técnico",
    description:
      "Melhorias estruturais para velocidade, experiência de navegação e uma base técnica mais saudável para mecanismos de busca.",
    items: ["Core Web Vitals", "Otimização técnica", "SEO on-page técnico"],
  },
  {
    icon: ShieldCheck,
    title: "Segurança & boas práticas",
    description:
      "Cuidados técnicos para reduzir riscos, proteger dados e manter aplicações atualizadas e mais confiáveis.",
    items: ["Validação e proteção", "Controle de acesso", "Atualizações técnicas"],
  },
  {
    icon: Wrench,
    title: "Suporte & evolução",
    description:
      "Manutenção, correções e melhorias contínuas para produtos que precisam acompanhar novas demandas do negócio.",
    items: ["Manutenção", "Correções", "Evolução de funcionalidades"],
  },
] as const;

const process = [
  ["01", "Entendimento", "Mapeamos o contexto, o problema e o objetivo antes de definir a solução."],
  ["02", "Planejamento", "Organizamos escopo, prioridades, arquitetura e experiência para reduzir retrabalho."],
  ["03", "Desenvolvimento", "Construímos com foco em clareza, qualidade técnica, responsividade e performance."],
  ["04", "Evolução", "Depois da entrega, o produto pode continuar recebendo melhorias conforme a necessidade."],
] as const;

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />

      <main className={`inner-page ${styles.page}`}>
        <PageHero
          eyebrow="SERVIÇOS"
          title="Tecnologia pensada para resolver e evoluir."
          description="Da presença digital a sistemas completos, desenvolvemos soluções com estratégia, experiência e base técnica preparada para crescer."
        />

        <section className={styles.services} aria-labelledby="services-title">
          <div className={styles.sectionHeading}>
            <p className="eyebrow">O QUE FAZEMOS</p>
            <h2 id="services-title">Soluções para diferentes momentos do seu negócio.</h2>
          </div>

          <div className={styles.grid}>
            {services.map(({ icon: Icon, title, description, items }) => (
              <article className={styles.card} key={title}>
                <div className={styles.icon} aria-hidden="true">
                  <Icon size={22} />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>

                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.process} aria-labelledby="process-title">
          <div className={styles.sectionHeading}>
            <p className="eyebrow">COMO TRABALHAMOS</p>
            <h2 id="process-title">Um processo claro do problema à evolução.</h2>
          </div>

          <div className={styles.processGrid}>
            {process.map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
