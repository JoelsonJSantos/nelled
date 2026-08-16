import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { PublicLink } from "@/components/navigation/public-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Parceiros",
  description: "Conheça as empresas e ferramentas recomendadas que fazem parte do ecossistema da Nelled Studio.",
};

export default async function Partners() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("A conexão com o conteúdo não está disponível.");
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("partners")
    .select("slug,name,short_description,coupon")
    .eq("active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order");

  if (error) {
    throw new Error("Não foi possível carregar os parceiros.");
  }

  const partners = data ?? [];

  return (
    <>
      <SiteHeader />

      <main className={`inner-page ${styles.page}`}>
        <PageHero eyebrow="ECOSSISTEMA" title="Parcerias com intenção." />

        {partners.length > 0 ? (
          <section className={styles.list} aria-label="Parceiros Nelled Studio">
            {partners.map((partner) => (
              <article className={styles.card} key={partner.slug}>
                <PublicLink href={`/parceiros/${partner.slug}`} className={styles.cardLink}>
                  <div className={styles.cardContent}>
                    <p className="eyebrow">PARCEIRO NELLED STUDIO</p>
                    <h2>{partner.name}</h2>
                    {partner.short_description && <p>{partner.short_description}</p>}
                  </div>

                  <div className={styles.cardFooter}>
                    {partner.coupon ? (
                      <span className={styles.coupon}>
                        <small>Cupom</small>
                        <strong>{partner.coupon}</strong>
                      </span>
                    ) : <span />}

                    <span className={styles.action}>
                      Ver parceiro <ArrowRight size={16} />
                    </span>
                  </div>
                </PublicLink>
              </article>
            ))}
          </section>
        ) : (
          <div className="empty-panel">
            <div className="empty-symbol">NS</div>
            <div>
              <h3>Ecossistema em formação</h3>
              <p>As parcerias recomendadas aparecerão aqui.</p>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
