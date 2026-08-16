import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Parceiros",
  description: "Gerenciamento de parceiros do ecossistema Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[]; saved?: string | string[] }>;

export default async function PartnersAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = params.status === "active" || params.status === "inactive" ? params.status : "";
  const saved = params.saved === "1";
  const supabase = await requireAdmin();
  let request = supabase.from("partners").select("id,name,slug,active,featured,website_url,updated_at").order("updated_at", { ascending: false });
  if (query) request = request.ilike("name", `%${query}%`);
  if (status) request = request.eq("active", status === "active");
  const { data, error } = await request;
  const rows = data ?? [];

  return (
    <>
      <SettingsSavedToast show={saved} title="Parceiro salvo" message="As alterações do parceiro foram salvas com sucesso." />
      <AdminPageHeader eyebrow="Conteúdo" title="Parceiros" description="Gerencie empresas, ferramentas e links do ecossistema Nelled." action={{ label: "Novo parceiro", href: "/admin/parceiros/novo", icon: Plus }} />
      <AdminFilters query={query} status={status} placeholder="Buscar parceiro por nome" statuses={[
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
      ]} />
      {error && <p className={styles.queryError}>Não foi possível carregar os parceiros. Tente novamente.</p>}
      {!error && rows.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {rows.map((partner) => (
            <Link className={`${styles.dataRow} ${styles.dataRowThree}`} href={`/admin/parceiros/${partner.id}`} key={partner.id}>
              <span className={styles.rowMain}><strong>{partner.name}</strong><span>{partner.website_url || `/${partner.slug}`}</span></span>
              <span className={styles.featured}>{partner.featured ? "Em destaque" : "—"}</span>
              <AdminStatusBadge status={partner.active ? "active" : "inactive"} />
            </Link>
          ))}
        </div>
      ) : !error && (
        <AdminEmptyState icon={Handshake} title="Nenhum parceiro encontrado" description={query || status ? "Ajuste os filtros para encontrar outros parceiros." : "Cadastre parceiros reais para apresentá-los no site."} action={!query && !status ? { label: "Cadastrar parceiro", href: "/admin/parceiros/novo" } : undefined} />
      )}
    </>
  );
}
