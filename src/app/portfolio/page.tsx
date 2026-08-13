import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Conheça os projetos e produtos digitais desenvolvidos pela Nelled Studio.",
};

export default async function Portfolio() {
  const supabase = await createClient();
  if (!supabase) throw new Error("A conexão com o conteúdo não está disponível.");
  const { data, error } = await supabase.from("projects").select("slug,name,category,excerpt,technologies,year").eq("status", "published").order("sort_order");
  if (error) throw new Error("Não foi possível carregar o portfólio.");
  const projects = (data ?? []).map((project) => ({ ...project, technologies: project.technologies ?? [] }));
  return <><SiteHeader/><main className="inner-page"><p className="eyebrow">PORTFÓLIO</p><h1>Projetos que criam movimento.</h1>{projects.length ? <div className="public-grid">{projects.map((project) => <Link href={`/portfolio/${project.slug}`} className="public-card" key={project.slug}><p className="eyebrow">{project.category || "PROJETO"}</p><h2>{project.name}</h2><p>{project.excerpt}</p><small>{project.technologies.join(" · ")}</small></Link>)}</div> : <div className="empty-panel"><div className="empty-symbol">NS</div><div><h3>Cases em preparação</h3><p>Os projetos publicados pela Nelled Studio aparecerão aqui.</p></div></div>}</main><SiteFooter/></>;
}
