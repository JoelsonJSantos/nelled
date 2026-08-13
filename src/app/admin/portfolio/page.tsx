import type { Metadata } from "next";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Gerenciamento de projetos e cases da Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[] }>;
const statuses = ["draft", "published", "archived"] as const;

export default async function PortfolioAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" && statuses.includes(params.status as typeof statuses[number]) ? params.status : "";
  const supabase = await requireAdmin();
  let request = supabase.from("projects").select("id,name,slug,status,category,featured,updated_at").order("updated_at", { ascending: false });
  if (query) request = request.ilike("name", `%${query}%`);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  const rows = data ?? [];

  return (
    <>
      <AdminPageHeader eyebrow="Conteúdo" title="Portfólio" description="Gerencie os projetos e cases exibidos no site público." action={{ label: "Novo projeto", href: "/admin/portfolio/novo", icon: Plus }} />
      <AdminFilters query={query} status={status} placeholder="Buscar projeto por nome" statuses={[
        { value: "draft", label: "Rascunho" },
        { value: "published", label: "Publicado" },
        { value: "archived", label: "Arquivado" },
      ]} />
      {error && <p className={styles.queryError}>Não foi possível carregar os projetos. Tente novamente.</p>}
      {!error && rows.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {rows.map((project) => (
            <Link className={styles.dataRow} href={`/admin/portfolio/${project.id}`} key={project.id}>
              <span className={styles.rowMain}><strong>{project.name}</strong><span>/{project.slug}</span></span>
              <span className={styles.rowMeta}>{project.category || "Sem categoria"}</span>
              <AdminStatusBadge status={project.status} />
              <span className={styles.rowMeta}>{formatAdminDate(project.updated_at)}</span>
            </Link>
          ))}
        </div>
      ) : !error && (
        <AdminEmptyState icon={FolderKanban} title="Nenhum projeto encontrado" description={query || status ? "Ajuste os filtros para encontrar outros projetos." : "Crie o primeiro projeto para começar a construir o portfólio."} action={!query && !status ? { label: "Criar projeto", href: "/admin/portfolio/novo" } : undefined} />
      )}
    </>
  );
}
