import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Contatos",
  description: "Gerenciamento das solicitações recebidas pela Nelled Studio.",
};

type SearchParams = Promise<{ q?: string | string[]; status?: string | string[] }>;
const statuses = ["new", "contacted", "proposal_sent", "won", "lost", "archived"] as const;

export default async function ContactsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const safeQuery = query.replace(/[,%().]/g, " ").trim();
  const status = typeof params.status === "string" && statuses.includes(params.status as typeof statuses[number]) ? params.status : "";
  const supabase = await requireAdmin();
  let request = supabase.from("contact_requests").select("id,name,company,email,project_type,status,created_at").order("created_at", { ascending: false });
  if (safeQuery) request = request.or(`name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,company.ilike.%${safeQuery}%`);
  if (status) request = request.eq("status", status);
  const { data, error } = await request;
  const contacts = data ?? [];

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Contatos" description="Acompanhe as solicitações recebidas pelo formulário do site." />
      <AdminFilters query={query} status={status} placeholder="Buscar por nome, empresa ou e-mail" statuses={[
        { value: "new", label: "Novo" },
        { value: "contacted", label: "Em contato" },
        { value: "proposal_sent", label: "Proposta enviada" },
        { value: "won", label: "Convertido" },
        { value: "lost", label: "Perdido" },
        { value: "archived", label: "Arquivado" },
      ]} />
      {error && <p className={styles.queryError}>Não foi possível carregar os contatos. Tente novamente.</p>}
      {!error && contacts.length ? (
        <div className={`${styles.panel} ${styles.dataList}`}>
          {contacts.map((contact) => (
            <div className={`${styles.dataRow} ${styles.dataRowFive}`} key={contact.id}>
              <span className={styles.rowMain}><strong>{contact.name}</strong><span>{contact.company || "Pessoa física"}</span></span>
              <span className={styles.rowMeta}>{contact.email}</span>
              <span className={styles.rowMeta}>{contact.project_type || "Não informado"}</span>
              <AdminStatusBadge status={contact.status} />
              <span className={styles.rowMeta}>{formatAdminDate(contact.created_at)}</span>
            </div>
          ))}
        </div>
      ) : !error && <AdminEmptyState icon={Inbox} title="Nenhum contato encontrado" description={query || status ? "Ajuste os filtros para encontrar outras solicitações." : "Novas solicitações enviadas pelo site aparecerão aqui."} />}
    </>
  );
}
