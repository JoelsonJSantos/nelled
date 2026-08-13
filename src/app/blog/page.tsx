import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artigos e perspectivas da Nelled Studio sobre tecnologia, design, negócios e produtos digitais.",
};
export default async function Blog() { const supabase = await createClient(); if (!supabase) throw new Error("A conexão com o conteúdo não está disponível."); const { data, error } = await supabase.from("blog_posts").select("slug,title,summary,published_at").eq("status", "published").lte("published_at", new Date().toISOString()).order("published_at", { ascending: false }); if (error) throw new Error("Não foi possível carregar os artigos."); const posts = data ?? []; return <><SiteHeader/><main className="inner-page"><p className="eyebrow">BLOG</p><h1>Ideias para produtos digitais melhores.</h1>{posts.length ? <div className="public-grid">{posts.map((post) => <Link href={`/blog/${post.slug}`} className="public-card" key={post.slug}><p className="eyebrow">ARTIGO</p><h2>{post.title}</h2><p>{post.summary}</p><small>{post.published_at ? new Intl.DateTimeFormat("pt-BR").format(new Date(post.published_at)) : ""}</small></Link>)}</div> : <div className="empty-panel"><div className="empty-symbol">NS</div><div><h3>Artigos em breve</h3><p>Os primeiros conteúdos serão publicados aqui.</p></div></div>}</main><SiteFooter/></>; }
