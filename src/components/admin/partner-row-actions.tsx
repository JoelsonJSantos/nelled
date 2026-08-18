"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Archive, ArchiveRestore, Edit3, Eye, EyeOff, LoaderCircle, Power, PowerOff, Trash2, X } from "lucide-react";

import { quickPartnerAction } from "@/app/admin/parceiros/actions";
import { AdminToast } from "@/components/admin/admin-toast";
import { initialPartnerActionState } from "@/lib/partner-action-state";

import styles from "./project-row-actions.module.css";

type PartnerRowActionsProps = {
  id: string;
  slug: string;
  active: boolean;
  archived: boolean;
  viewable: boolean;
};

export function PartnerRowActions({ id, slug, active, archived, viewable }: PartnerRowActionsProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionId, setActionId] = useState(0);
  const [state, action, pending] = useActionState(quickPartnerAction, initialPartnerActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className={styles.wrap} onSubmitCapture={() => setActionId((current) => current + 1)}>
      <div className={styles.actions} aria-label="Ações do parceiro">
        <Link href={`/admin/parceiros/${id}`} title="Editar parceiro"><Edit3 size={15} /><span>Editar</span></Link>
        {viewable ? (
          <Link href={`/parceiros/${slug}`} target="_blank" rel="noreferrer" title="Visualizar parceiro"><Eye size={15} /><span>Ver</span></Link>
        ) : (
          <span className={styles.disabled} title="Ative e restaure o parceiro para visualizar"><EyeOff size={15} /><span>Ver</span></span>
        )}
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          {!archived && (
            <button name="operation" value={active ? "deactivate" : "activate"} type="submit" disabled={pending} title={active ? "Desativar" : "Ativar"}>
              {active ? <PowerOff size={15} /> : <Power size={15} />}<span>{active ? "Desativar" : "Ativar"}</span>
            </button>
          )}
          {archived ? (
            <button name="operation" value="restore" type="submit" disabled={pending} title="Restaurar"><ArchiveRestore size={15} /><span>Restaurar</span></button>
          ) : (
            <button name="operation" value="archive" type="submit" disabled={pending} title="Arquivar"><Archive size={15} /><span>Arquivar</span></button>
          )}
        </form>
        <button className={styles.deleteButton} type="button" onClick={() => setConfirmDelete(true)} title="Excluir"><Trash2 size={15} /><span>Excluir</span></button>
      </div>

      {pending && <span className={styles.pending}><LoaderCircle size={14} />Processando…</span>}
      {!pending && state.status !== "idle" && <AdminToast key={`${actionId}-${state.status}-${state.message}`} message={state.message} type={state.status} />}

      {confirmDelete && state.status !== "success" && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target && !pending) setConfirmDelete(false);
        }}>
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby={`delete-partner-${id}`}>
            <button className={styles.close} type="button" onClick={() => setConfirmDelete(false)} disabled={pending} aria-label="Fechar confirmação"><X size={18} /></button>
            <Trash2 size={24} />
            <h2 id={`delete-partner-${id}`}>Excluir parceiro?</h2>
            <p>Esta ação remove o parceiro permanentemente e não pode ser desfeita. Campanhas vinculadas deixarão de apontar para ele.</p>
            <div>
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={pending}>Cancelar</button>
              <form action={action}>
                <input type="hidden" name="id" value={id} />
                <button className={styles.confirmDelete} name="operation" value="delete" type="submit" disabled={pending}>Excluir definitivamente</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
