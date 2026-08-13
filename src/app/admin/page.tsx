import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, BriefcaseBusiness, Inbox, Mail, Users } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Visão geral do painel administrativo da Nelled Studio.",
};

export default async function AdminDashboard() {
  const supabase = await requireAdmin();
  const [projectCount, postCount, partnerCount, contactCount, recentProjects, recentPosts, recentContacts] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("projects").select("id,name,status,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("blog_posts").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(5),
    supabase.from("contact_requests").select("id,name,email,status,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const hasQueryError = [projectCount, postCount, partnerCount, contactCount, recentProjects, recentPosts, recentContacts]
    .some((result) => Boolean(result.error));

  return (
    <>
      <AdminPageHeader eyebrow="Visão geral" title="Dashboard" description="Acompanhe o conteúdo publicado e as solicitações mais recentes da Nelled Studio." />
      {hasQueryError && <p className={styles.queryError}>Parte dos dados não pôde ser carregada. Atualize a página ou verifique a conexão com o Supabase.</p>}
      <div className={styles.statGrid}>
        <AdminStatCard label="Projetos publicados" value={projectCount.count ?? 0} href="/admin/portfolio" icon={BriefcaseBusiness} />
        <AdminStatCard label="Posts publicados" value={postCount.count ?? 0} href="/admin/blog" icon={BookOpen} />
        <AdminStatCard label="Parceiros ativos" value={partnerCount.count ?? 0} href="/admin/parceiros" icon={Users} />
        <AdminStatCard label="Contatos novos" value={contactCount.count ?? 0} href="/admin/contatos" icon={Mail} />
      </div>

      <div className={styles.sectionGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>Últimos projetos</h2><Link href="/admin/portfolio">Ver todos</Link></div>
          {(recentProjects.data ?? []).length ? (
            <div className={styles.compactList}>{(recentProjects.data ?? []).map((project) => (
              <Link className={styles.compactRow} href={`/admin/portfolio/${project.id}`} key={project.id}>
                <span className={styles.rowMain}><strong>{project.name}</strong><span>{formatAdminDate(project.updated_at)}</span></span>
                <AdminStatusBadge status={project.status} />
              </Link>
            ))}</div>
          ) : <AdminEmptyState compact icon={BriefcaseBusiness} title="Nenhum projeto" description="Os projetos mais recentes aparecerão aqui." />}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>Últimos artigos</h2><Link href="/admin/blog">Ver todos</Link></div>
          {(recentPosts.data ?? []).length ? (
            <div className={styles.compactList}>{(recentPosts.data ?? []).map((post) => (
              <Link className={styles.compactRow} href={`/admin/blog/${post.id}`} key={post.id}>
                <span className={styles.rowMain}><strong>{post.title}</strong><span>{formatAdminDate(post.updated_at)}</span></span>
                <AdminStatusBadge status={post.status} />
              </Link>
            ))}</div>
          ) : <AdminEmptyState compact icon={BookOpen} title="Nenhum artigo" description="Os artigos mais recentes aparecerão aqui." />}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}><h2>Últimos contatos</h2><Link href="/admin/contatos">Ver todos</Link></div>
          {(recentContacts.data ?? []).length ? (
            <div className={styles.compactList}>{(recentContacts.data ?? []).map((contact) => (
              <Link className={styles.compactRow} href="/admin/contatos" key={contact.id}>
                <span className={styles.rowMain}><strong>{contact.name}</strong><span>{contact.email} · {formatAdminDate(contact.created_at)}</span></span>
                <AdminStatusBadge status={contact.status} />
              </Link>
            ))}</div>
          ) : <AdminEmptyState compact icon={Inbox} title="Nenhum contato" description="Novas solicitações aparecerão aqui." />}
        </section>
      </div>
    </>
  );
}
