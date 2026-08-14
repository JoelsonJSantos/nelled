import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Parceiros",
  description: "Conheça as empresas e ferramentas recomendadas que fazem parte do ecossistema da Nelled Studio.",
};
export default async function Partners() { const supabase = await createClient(); if (!supabase) throw new Error("A conexão com o conteúdo não está disponível."); const now = new Date().toISOString(); const { data, error } = await supabase.from("partners").select("slug,name,short_description,coupon").eq("active", true).or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gte.${now}`).order("sort_order"); if (error) throw new Error("Não foi possível carregar os parceiros."); const partners = data ?? []; return <><SiteHeader/><main className="inner-page"><PageHero eyebrow="ECOSSISTEMA" title="Parcerias com intenção." />{partners.length ? <div className="public-grid">{partners.map((partner) => <Link href={`/parceiros/${partner.slug}`} className="public-card" key={partner.slug}><p className="eyebrow">PARCEIRO NELLED STUDIO</p><h2>{partner.name}</h2><p>{partner.short_description}</p>{partner.coupon && <small>Cupom: {partner.coupon}</small>}</Link>)}</div> : <div className="empty-panel"><div className="empty-symbol">NS</div><div><h3>Ecossistema em formação</h3><p>As parcerias recomendadas aparecerão aqui.</p></div></div>}</main><SiteFooter/></>; }
