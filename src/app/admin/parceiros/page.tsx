import type { Metadata } from "next";
import { Handshake, Plus, Star } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { PartnerRowActions } from "@/components/admin/partner-row-actions";
import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";
import adminStyles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Parceiros",
  description: "Gerenciamento de parceiros do ecossistema Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[]; saved?: string | string[] }>;

export default async function PartnersAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = params.status === "active" || params.status === "inactive" || params.status === "archived" ? params.status : "";
  const saved = params.saved === "1";
  const supabase = await requireAdmin();
  let request = supabase.from("partners").select("id,name,slug,active,featured,website_url,archived_at,updated_at").order("updated_at", { ascending: false });
  if (query) request = request.ilike("name", `%${query}%`);
  if (status === "archived") request = request.not("archived_at", "is", null);
  else {
    request = request.is("archived_at", null);
    if (status) request = request.eq("active", status === "active");
  }
  const { data, error } = await request;
  const rows = data ?? [];

  return (
    <>
      <SettingsSavedToast show={saved} title="Parceiro salvo" message="As alterações do parceiro foram salvas com sucesso." />
      <AdminPageHeader eyebrow="Conteúdo" title="Parceiros" description="Gerencie empresas, ferramentas e links do ecossistema Nelled." action={{ label: "Novo parceiro", href: "/admin/parceiros/novo", icon: Plus }} />
      <AdminFilters query={query} status={status} placeholder="Buscar parceiro por nome" statuses={[
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
        { value: "archived", label: "Arquivado" },
      ]} allStatusesLabel="Ativos e inativos" />
      {error && <p className={adminStyles.queryError}>Não foi possível carregar os parceiros. Tente novamente.</p>}
      {!error && rows.length ? (
        <div className={styles.list}>
          {rows.map((partner) => {
            const archived = Boolean(partner.archived_at);
            const viewable = partner.active && !archived;

            return (
              <article className={styles.row} key={partner.id}>
                <div className={styles.identity}><strong>{partner.name}</strong><span>{partner.website_url || `/${partner.slug}`}</span></div>
                <span className={styles.featured}>{partner.featured ? <><Star size={12} />Em destaque</> : "—"}</span>
                <AdminStatusBadge status={archived ? "archived" : partner.active ? "active" : "inactive"} />
                <PartnerRowActions id={partner.id} slug={partner.slug} active={partner.active} archived={archived} viewable={viewable} />
              </article>
            );
          })}
        </div>
      ) : !error && (
        <AdminEmptyState icon={Handshake} title="Nenhum parceiro encontrado" description={query || status ? "Ajuste os filtros para encontrar outros parceiros." : "Cadastre parceiros reais para apresentá-los no site."} action={!query && !status ? { label: "Cadastrar parceiro", href: "/admin/parceiros/novo" } : undefined} />
      )}
    </>
  );
}
