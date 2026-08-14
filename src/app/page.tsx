import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Blocks, Code2, Cpu, Layers3, Palette, ShieldCheck } from "lucide-react";
import { ProjectImage } from "@/components/project-image";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getFeaturedProjects } from "@/lib/public-content";
import portfolioStyles from "./home-portfolio.module.css";

export const metadata: Metadata = {
  title: { absolute: "Nelled Studio - Criando soluções digitais" },
  description: "A Nelled Studio cria sites, sistemas, plataformas e produtos digitais que transformam ideias em resultados.",
};

const services = [
  [Code2, "Desenvolvimento Web", "Sites institucionais, portais, aplicações e experiências web modernas."],
  [Blocks, "Sistemas personalizados", "Soluções sob medida para digitalizar processos e operações."],
  [Layers3, "Aplicações SaaS", "Plataformas escaláveis, seguras e prontas para evoluir."],
  [Palette, "UI/UX & Interfaces", "Interfaces intuitivas, acessíveis e pensadas para pessoas."],
  [Cpu, "Integrações", "APIs, pagamentos, autenticação, e-mails e serviços externos."],
  [ShieldCheck, "Suporte & evolução", "Manutenção e melhoria contínua de aplicações digitais."],
];

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();
  return <><SiteHeader /><main>
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">DESENVOLVIMENTO <i /> DESIGN <i /> TECNOLOGIA</p>
        <h1>Criando soluções <span>digitais.</span></h1>
        <p className="lede">Websites, sistemas, plataformas e produtos digitais que impulsionam negócios e transformam ideias em resultados.</p>
        <p className="subtle">Da estratégia à entrega, desenvolvemos experiências digitais completas com tecnologia, design inteligente e foco em performance.</p>
        <div className="actions"><Link className="button primary" href="/portfolio">Conheça nosso trabalho <ArrowRight size={17}/></Link><Link className="button ghost" href="/contato">Fale conosco</Link></div>
      </div>
      <div className="ns-stage" aria-label="Símbolo Nelled Studio"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><Image src="/nelled-studio-hero-dark.png" alt="Logo Nelled Studio" width={560} height={560} priority className="hero-logo hero-logo-dark"/><Image src="/nelled-studio-hero-light.png" alt="" aria-hidden="true" width={560} height={560} priority className="hero-logo hero-logo-light"/></div>
    </section>
    <section className="section"><div className="section-heading"><div><p className="eyebrow">O QUE CONSTRUÍMOS</p><h2>Nossos serviços</h2></div></div><div className="service-grid">{services.map(([Icon,title,text]) => <article className="service-card" key={title as string}><Icon size={22}/><h3>{title as string}</h3><p>{text as string}</p></article>)}</div></section>
    <section className="section showcase"><div className="section-heading"><div><p className="eyebrow">PROJETOS SELECIONADOS</p><h2>Portfólio em destaque</h2></div><Link className="text-link" href="/portfolio">Ver todos os projetos <ArrowRight size={16}/></Link></div>{featuredProjects.length ? <div className={portfolioStyles.grid}>{featuredProjects.map((project) => <article className={portfolioStyles.card} key={project.id}><Link href={`/portfolio/${project.slug}`} className={portfolioStyles.media}><ProjectImage src={project.coverImage} alt={`Capa do projeto ${project.name}`} sizes="(max-width: 760px) 100vw, 33vw" /></Link><div><p className="eyebrow">{project.category || "PROJETO"} · {project.year}</p><h3><Link href={`/portfolio/${project.slug}`}>{project.name}</Link></h3><p>{project.excerpt}</p><Link href={`/portfolio/${project.slug}`} className={portfolioStyles.link}>Ver case <ArrowRight size={15} /></Link></div></article>)}</div> : <div className="empty-panel"><div className="empty-symbol">NS</div><div><h3>Projetos com contexto, não promessas.</h3><p>Os cases publicados aqui serão projetos reais da Nelled Studio.</p></div></div>}</section>
    <section className="section cta"><p className="eyebrow">VAMOS CONVERSAR</p><h2>Vamos tirar seu projeto<br/>do papel?</h2><p>Conte com a Nelled Studio para transformar sua ideia em uma solução digital moderna, escalável e preparada para crescer.</p><Link className="button primary" href="/contato">Fale com a Nelled Studio <ArrowRight size={17}/></Link></section>
  </main><SiteFooter /></>;
}
