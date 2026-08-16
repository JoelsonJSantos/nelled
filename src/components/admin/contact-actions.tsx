"use client";

import Link from "next/link";
import { Archive, ArrowUpRight, LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { addContactNote, updateContactStatus } from "@/app/admin/contatos/actions";
import { AdminToast } from "@/components/admin/admin-toast";
import { initialContactActionState } from "@/lib/contact-action-state";
import { contactArchivedStatus, contactStatuses, type ContactStatus } from "@/lib/contacts";

import styles from "./contact-crm.module.css";

export function ContactStatusControl({ id, status }: { id: string; status: ContactStatus }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateContactStatus, initialContactActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <form action={action} className={styles.statusForm}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`contact-status-${id}`}>Status</label>
      <div>
        <select id={`contact-status-${id}`} name="status" defaultValue={status} disabled={pending}>
          {contactStatuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button type="submit" disabled={pending}>{pending ? <LoaderCircle className={styles.spinner} size={15} /> : "Salvar status"}</button>
      </div>
      {!pending && state.status !== "idle" && <AdminToast key={state.message} message={state.message} type={state.status} />}
    </form>
  );
}

export function ContactNoteForm({ id }: { id: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addContactNote, initialContactActionState);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    router.refresh();
  }, [router, state.status]);

  return (
    <form ref={formRef} action={action} className={styles.noteForm}>
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`contact-note-${id}`}>Nova nota interna</label>
      <textarea id={`contact-note-${id}`} name="body" rows={4} maxLength={4000} placeholder="Registre um contexto relevante para o atendimento." disabled={pending} aria-invalid={Boolean(state.fieldErrors?.body?.[0])} />
      {state.fieldErrors?.body?.[0] && <small className={styles.fieldError}>{state.fieldErrors.body[0]}</small>}
      <button type="submit" disabled={pending}>{pending ? <><LoaderCircle className={styles.spinner} size={15} /> Salvando…</> : "Adicionar nota"}</button>
      {!pending && state.status !== "idle" && <AdminToast key={state.message} message={state.message} type={state.status} />}
    </form>
  );
}

export function ContactRowActions({ id, archived }: { id: string; archived: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateContactStatus, initialContactActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className={styles.rowActions}>
      <Link href={`/admin/contatos/${id}`} title="Abrir contato"><ArrowUpRight size={15} /><span>Abrir</span></Link>
      {!archived && <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={contactArchivedStatus} /><button type="submit" disabled={pending} title="Arquivar contato">{pending ? <LoaderCircle className={styles.spinner} size={15} /> : <Archive size={15} />}<span>Arquivar</span></button></form>}
      {!pending && state.status !== "idle" && <AdminToast key={state.message} message={state.message} type={state.status} />}
    </div>
  );
}
