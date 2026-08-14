import type { Metadata } from "next";
import { FolderKanban, Plus, Search, Star } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { ProjectRowActions } from "@/components/admin/project-row-actions";
import { ProjectImage } from "@/components/project-image";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";
import { normalizeProjectRecord, projectStatuses } from "@/lib/portfolio";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Portfólio",
  description: "Gerenciamento de projetos e cases da Nelled Studio.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const sorts = ["updated_desc", "updated_asc", "name_asc", "year_desc", "order_asc"] as const;

function param(input: string | string[] | undefined) {
  return typeof input === "string" ? input.trim() : "";
}

export default async function PortfolioAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = param(params.q);
  const rawStatus = param(params.status);
  const status = projectStatuses.includes(rawStatus as (typeof projectStatuses)[number]) ? rawStatus : "";
  const category = param(params.category);
  const rawSort = param(params.sort);
  const sort = sorts.includes(rawSort as (typeof sorts)[number]) ? rawSort : "updated_desc";
  const supabase = await requireAdmin();

  let request = supabase.from("projects").select("*");
  if (query) request = request.or(`name.ilike.%${query.replace(/[,%()]/g, "")}%,slug.ilike.%${query.replace(/[,%()]/g, "")}%`);
  if (status) request = request.eq("status", status);
  if (category) request = request.eq("category", category);

  if (sort === "updated_asc") request = request.order("updated_at", { ascending: true });
  else if (sort === "name_asc") request = request.order("name", { ascending: true });
  else if (sort === "year_desc") request = request.order("year", { ascending: false, nullsFirst: false });
  else if (sort === "order_asc") request = request.order("sort_order", { ascending: true }).order("updated_at", { ascending: false });
  else request = request.order("updated_at", { ascending: false });

  const [projectsResult, categoriesResult] = await Promise.all([
    request,
    supabase.from("projects").select("category").not("category", "is", null),
  ]);
  const rows = (projectsResult.data ?? []).map(normalizeProjectRecord);
  const categories = Array.from(new Set((categoriesResult.data ?? []).map((item) => item.category).filter((item): item is string => Boolean(item)))).sort();
  const hasFilters = Boolean(query || status || category || rawSort);

  return (
    <>
      <AdminPageHeader eyebrow="Conteúdo" title="Portfólio" description="Crie, publique e organize os cases exibidos no site." action={{ label: "Novo projeto", href: "/admin/portfolio/novo", icon: Plus }} />

      <form className={styles.filters}>
        <div className={styles.search}><Search size={16} /><input name="q" defaultValue={query} placeholder="Buscar por nome ou slug" aria-label="Buscar projeto" /></div>
        <select name="status" defaultValue={status} aria-label="Filtrar por status"><option value="">Todos os status</option><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select>
        <select name="category" defaultValue={category} aria-label="Filtrar por categoria"><option value="">Todas as categorias</option>{categories.map((item) => <option value={item} key={item}>{item}</option>)}</select>
        <select name="sort" defaultValue={sort} aria-label="Ordenar projetos"><option value="updated_desc">Atualizados recentemente</option><option value="updated_asc">Atualizados primeiro</option><option value="name_asc">Nome A–Z</option><option value="year_desc">Ano mais recente</option><option value="order_asc">Ordem do site</option></select>
        <button type="submit">Aplicar</button>
      </form>

      {(projectsResult.error || categoriesResult.error) && <p className={styles.queryError}>Não foi possível carregar os projetos. Tente novamente.</p>}
      {!projectsResult.error && rows.length ? (
        <div className={styles.list}>
          {rows.map((project) => (
            <article className={styles.row} key={project.id}>
              <div className={styles.thumb}>
                <ProjectImage src={project.coverImage} alt="" sizes="84px" />
              </div>
              <div className={styles.identity}>
                <strong>{project.name}</strong>
                <span>/{project.slug}</span>
                <small>{project.category || "Sem categoria"}</small>
              </div>
              <div className={styles.status}><AdminStatusBadge status={project.status} />{project.featured && <span className={styles.featured}><Star size={12} />Destaque</span>}</div>
              <div className={styles.meta}><span>{project.year}</span><small>Atualizado {formatAdminDate(project.updatedAt)}</small></div>
              <ProjectRowActions id={project.id} slug={project.slug} status={project.status} />
            </article>
          ))}
        </div>
      ) : !projectsResult.error && (
        <AdminEmptyState icon={FolderKanban} title="Nenhum projeto encontrado" description={hasFilters ? "Ajuste os filtros para encontrar outros projetos." : "Crie o primeiro projeto para começar a construir o portfólio."} action={!hasFilters ? { label: "Criar projeto", href: "/admin/portfolio/novo" } : undefined} />
      )}
    </>
  );
}
