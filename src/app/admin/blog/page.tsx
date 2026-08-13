import type { Metadata } from "next";
import Link from "next/link";
import { FilePenLine, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Blog",
  description: "Gerenciamento de artigos e publicações da Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[] }>;
const statuses = ["draft", "scheduled", "published", "archived"] as const;

export default async function BlogAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const status = typeof params.status === "string" && statuses.includes(params.status as typeof statuses[number]) ? params.status : "";
  const supabase = await requireAdmin();
  let request = supabase.from("blog_posts").select("id,title,slug,status,featured,updated_at").order("updated_at", { ascending: false });
  if (query) request = request.ilike("title", `%${query}%`);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  const rows = data ?? [];

  return (
    <>
      <AdminPageHeader eyebrow="Conteúdo" title="Blog" description="Organize artigos, rascunhos e publicações da Nelled Studio." action={{ label: "Novo artigo", href: "/admin/blog/novo", icon: Plus }} />
      <AdminFilters query={query} status={status} placeholder="Buscar artigo por título" statuses={[
        { value: "draft", label: "Rascunho" },
        { value: "scheduled", label: "Agendado" },
        { value: "published", label: "Publicado" },
        { value: "archived", label: "Arquivado" },
      ]} />
      {error && <p className={styles.queryError}>Não foi possível carregar os artigos. Tente novamente.</p>}
      {!error && rows.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {rows.map((post) => (
            <Link className={styles.dataRow} href={`/admin/blog/${post.id}`} key={post.id}>
              <span className={styles.rowMain}><strong>{post.title}</strong><span>/{post.slug}</span></span>
              <span className={styles.featured}>{post.featured ? "Em destaque" : "—"}</span>
              <AdminStatusBadge status={post.status} />
              <span className={styles.rowMeta}>{formatAdminDate(post.updated_at)}</span>
            </Link>
          ))}
        </div>
      ) : !error && (
        <AdminEmptyState icon={FilePenLine} title="Nenhum artigo encontrado" description={query || status ? "Ajuste os filtros para encontrar outros artigos." : "Crie o primeiro conteúdo para começar a publicar no blog."} action={!query && !status ? { label: "Criar artigo", href: "/admin/blog/novo" } : undefined} />
      )}
    </>
  );
}
