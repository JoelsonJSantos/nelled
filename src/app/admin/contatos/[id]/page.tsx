import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";

import { ContactNoteForm, ContactStatusControl } from "@/components/admin/contact-actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { requireAdmin } from "@/lib/admin";
import { formatAdminDateTime } from "@/lib/admin-format";
import { contactStatusLabel, normalizeContactStatus } from "@/lib/contacts";

import styles from "@/components/admin/contact-crm.module.css";

export const metadata: Metadata = {
  title: "Contato",
  description: "Detalhes e acompanhamento de uma solicitação recebida.",
};

type Props = { params: Promise<{ id: string }> };

export default async function ContactDetail({ params }: Props) {
  const supabase = await requireAdmin();
  const { id } = await params;
  const [{ data: contact, error: contactError }, { data: notes, error: notesError }, { data: history, error: historyError }] = await Promise.all([
    supabase.from("contact_requests").select("id,name,company,email,whatsapp,project_type,budget_range,message,status,created_at").eq("id", id).maybeSingle(),
    supabase.from("contact_notes").select("id,body,author_id,created_at").eq("contact_id", id).order("created_at", { ascending: false }),
    supabase.from("contact_status_history").select("id,previous_status,next_status,author_id,created_at").eq("contact_id", id).order("created_at", { ascending: false }),
  ]);

  if (contactError || !contact) notFound();

  const status = normalizeContactStatus(contact.status);
  const hasSideError = Boolean(notesError || historyError);

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title={contact.name} description="Acompanhe a solicitação, atualize o status e mantenha o histórico interno." />
      {hasSideError && <p className={styles.queryError}>Parte do histórico não pôde ser carregada. Atualize a página para tentar novamente.</p>}
      <div className={styles.detail}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <h2>Solicitação</h2>
            <dl className={styles.contactData}>
              <div><dt>E-mail</dt><dd><a className={styles.emailLink} href={`mailto:${contact.email}`}><Mail size={13} /> {contact.email}</a></dd></div>
              <div><dt>Telefone</dt><dd>{contact.whatsapp || "Não informado"}</dd></div>
              <div><dt>Empresa</dt><dd>{contact.company || "Pessoa física"}</dd></div>
              <div><dt>Tipo de projeto</dt><dd>{contact.project_type || "Não informado"}</dd></div>
              <div><dt>Investimento previsto</dt><dd>{contact.budget_range || "Não informado"}</dd></div>
              <div><dt>Recebido em</dt><dd>{formatAdminDateTime(contact.created_at)}</dd></div>
            </dl>
          </section>

          <section className={styles.card}>
            <h2>Mensagem</h2>
            <p className={styles.message}>{contact.message}</p>
          </section>

          <section className={styles.card}>
            <h2>Notas internas</h2>
            <p>Visíveis apenas para administradores da Nelled Studio.</p>
            <ContactNoteForm id={contact.id} />
            {notes?.length ? <div className={styles.notes}>{notes.map((note) => <article className={styles.note} key={note.id}><p>{note.body}</p><small>{note.author_id ? "Administrador" : "Autor não disponível"} · {formatAdminDateTime(note.created_at)}</small></article>)}</div> : <div className={styles.empty}>Nenhuma nota interna registrada.</div>}
          </section>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.card}>
            <h2>Status atual</h2>
            <p><AdminStatusBadge status={status} /></p>
            <ContactStatusControl id={contact.id} status={status} />
          </section>

          <section className={styles.card}>
            <h2>Histórico de status</h2>
            {history?.length ? <div className={styles.history}>{history.map((item) => <div className={styles.historyItem} key={item.id}><strong>{contactStatusLabel(item.previous_status)} <span>→</span> {contactStatusLabel(item.next_status)}</strong><small>{item.author_id ? "Administrador" : "Autor não disponível"} · {formatAdminDateTime(item.created_at)}</small></div>)}</div> : <div className={styles.empty}>Nenhuma mudança de status registrada.</div>}
          </section>
        </aside>
      </div>
    </>
  );
}
