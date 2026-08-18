import type { Metadata } from "next";
import Link from "next/link";
import { FilePenLine, Plus, Star } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { BlogRowActions } from "@/components/admin/blog/blog-row-actions";
import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";
import adminStyles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Gerenciamento de artigos e publicações da Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[]; saved?: string | string[] }>;
const statuses = ["draft", "scheduled", "published", "archived"] as const;

export default async function BlogAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" && statuses.includes(params.status as typeof statuses[number]) ? params.status : "";
  const saved = params.saved === "1";
  const supabase = await requireAdmin();
  let request = supabase.from("blog_posts").select("id,title,slug,status,featured,updated_at").order("updated_at", { ascending: false });
  if (query) request = request.ilike("title", `%${query}%`);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  const rows = data ?? [];

  return (
    <>
      <SettingsSavedToast show={saved} title="Artigo salvo" message="As alterações do artigo foram salvas com sucesso." />
      <AdminPageHeader eyebrow="Conteúdo" title="Blog" description="Organize artigos, rascunhos e publicações da Nelled Studio." action={{ label: "Novo artigo", href: "/admin/blog/novo", icon: Plus }} />
      <Link className={`${adminStyles.secondaryAction} ${adminStyles.blogCategoriesLink}`} href="/admin/blog/categorias">
        Gerenciar categorias
      </Link>
      <AdminFilters query={query} status={status} placeholder="Buscar artigo por título" statuses={[
        { value: "draft", label: "Rascunho" },
        { value: "scheduled", label: "Agendado" },
        { value: "published", label: "Publicado" },
        { value: "archived", label: "Arquivado" },
      ]} />
      {error && <p className={adminStyles.queryError}>Não foi possível carregar os artigos. Tente novamente.</p>}
      {!error && rows.length ? (
        <div className={styles.list}>
          {rows.map((post) => (
            <article className={styles.row} key={post.id}>
              <div className={styles.identity}><strong>{post.title}</strong><span>/{post.slug}</span></div>
              <span className={styles.featured}>{post.featured ? <><Star size={12} />Em destaque</> : "—"}</span>
              <AdminStatusBadge status={post.status} />
              <span className={styles.date}>{formatAdminDate(post.updated_at)}</span>
              <BlogRowActions id={post.id} slug={post.slug} status={post.status} />
            </article>
          ))}
        </div>
      ) : !error && (
        <AdminEmptyState icon={FilePenLine} title="Nenhum artigo encontrado" description={query || status ? "Ajuste os filtros para encontrar outros artigos." : "Crie o primeiro conteúdo para começar a publicar no blog."} action={!query && !status ? { label: "Criar artigo", href: "/admin/blog/novo" } : undefined} />
      )}
    </>
  );
}
