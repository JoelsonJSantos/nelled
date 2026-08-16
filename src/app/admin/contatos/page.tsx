import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, Inbox, UserRoundCheck } from "lucide-react";
import { ContactRowActions } from "@/components/admin/contact-actions";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { contactArchivedStatus, contactStatuses, contactSummaryStatuses, normalizeContactStatus } from "@/lib/contacts";
import styles from "@/components/admin/admin-ui.module.css";
import contactStyles from "@/components/admin/contact-crm.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Contatos",
  description: "Gerenciamento das solicitações recebidas pela Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[]; page?: string | string[] }>;
const pageSize = 20;

export default async function ContactsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const safeQuery = query.replace(/[%_,().]/g, " ").trim();
  const status = typeof params.status === "string" && contactStatuses.some((item) => item.value === params.status) ? params.status : "";
  const rawPage = typeof params.page === "string" ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const supabase = await requireAdmin();
  let request = supabase.from("contact_requests").select("id,name,company,email,project_type,status,created_at", { count: "exact" }).order("created_at", { ascending: false });
  if (safeQuery) request = request.or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,company.ilike.%${safeQuery}%`);
  if (status) request = request.eq("status", status);
  const [result, ...summaryCounts] = await Promise.all([
    request.range((page - 1) * pageSize, page * pageSize - 1),
    ...contactSummaryStatuses.map((item) => supabase.from("contact_requests").select("id", { count: "exact", head: true }).eq("status", item.value)),
  ]);
  const { data, error, count } = result;
  const contacts = data ?? [];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const iconByStatus = { new: Inbox, contacted: UserRoundCheck, proposal_sent: Clock3, won: CheckCircle2 } as const;
  const queryString = (nextPage: number) => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (status) next.set("status", status);
    next.set("page", String(nextPage));
    return `/admin/contatos?${next.toString()}`;
  };

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Contatos" description="Acompanhe as solicitações recebidas pelo formulário do site." />
      <div className={styles.statGrid}>
        {contactSummaryStatuses.map((item, index) => <AdminStatCard key={item.value} label={item.summary} value={summaryCounts[index]?.count ?? 0} href={`/admin/contatos?status=${item.value}`} icon={iconByStatus[item.value as keyof typeof iconByStatus]} />)}
      </div>
      <div style={{ marginTop: 18 }}>
      <AdminFilters query={query} status={status} placeholder="Buscar por nome, empresa ou e-mail" statuses={[
        ...contactStatuses.map((item) => ({ value: item.value, label: item.label })),
      ]} />
      </div>
      {error && <p className={styles.queryError}>Não foi possível carregar os contatos. Tente novamente.</p>}
      {!error && contacts.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {contacts.map((contact) => (
            <div className={`${styles.dataRow} ${styles.dataRowContact}`} key={contact.id}>
              <span className={styles.rowMain}><Link href={`/admin/contatos/${contact.id}`}><strong>{contact.name}</strong></Link><span>{contact.company || "Pessoa física"}</span></span>
              <span className={styles.rowMeta}>{contact.email}</span>
              <span className={styles.rowMeta}>{contact.project_type || "Não informado"}</span>
              <AdminStatusBadge status={contact.status} />
              <span className={styles.rowMeta}>{formatAdminDate(contact.created_at)}</span>
              <ContactRowActions id={contact.id} archived={normalizeContactStatus(contact.status) === contactArchivedStatus} />
            </div>
          ))}
        </div>
      ) : !error && <AdminEmptyState icon={Inbox} title="Nenhum contato encontrado" description={query || status ? "Ajuste os filtros para encontrar outras solicitações." : "Novas solicitações enviadas pelo site aparecerão aqui."} />}
      {!error && contacts.length > 0 && <div className={contactStyles.pagination}><span>Página {page} de {totalPages} · {count ?? 0} contatos</span><nav aria-label="Paginação de contatos">{page > 1 ? <Link href={queryString(page - 1)}>Anterior</Link> : <span>Anterior</span>}{page < totalPages ? <Link href={queryString(page + 1)}>Próxima</Link> : <span>Próxima</span>}</nav></div>}
    </>
  );
}
