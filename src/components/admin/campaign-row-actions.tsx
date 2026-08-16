"use client";

import Link from "next/link";
import { ExternalLink, LoaderCircle, Pencil, Power, PowerOff, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { quickCampaignAction } from "@/app/admin/anuncios/actions";
import { AdminToast } from "@/components/admin/admin-toast";
import { initialCampaignActionState } from "@/lib/campaign-action-state";

import styles from "./campaign-row-actions.module.css";

export function CampaignRowActions({ id, targetUrl, active }: { id: string; targetUrl: string; active: boolean }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionId, setActionId] = useState(0);
  const [state, action, pending] = useActionState(quickCampaignAction, initialCampaignActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className={styles.wrap} onSubmitCapture={() => setActionId((value) => value + 1)}>
      <div className={styles.actions} aria-label="Ações da campanha">
        <Link href={`/admin/anuncios/${id}`} title="Editar campanha"><Pencil size={15} /><span>Editar</span></Link>
        <Link href={targetUrl} target="_blank" rel="noreferrer" title="Abrir destino"><ExternalLink size={15} /><span>Ver</span></Link>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <button name="operation" value={active ? "deactivate" : "activate"} type="submit" disabled={pending} title={active ? "Desativar" : "Ativar"}>
            {active ? <PowerOff size={15} /> : <Power size={15} />}<span>{active ? "Desativar" : "Ativar"}</span>
          </button>
        </form>
        <button type="button" className={styles.deleteButton} onClick={() => setConfirmDelete(true)} title="Excluir campanha"><Trash2 size={15} /><span>Excluir</span></button>
      </div>
      {pending && <span className={styles.pending}><LoaderCircle size={14} />Processando…</span>}
      {!pending && state.status !== "idle" && <AdminToast key={`${actionId}-${state.status}-${state.message}`} message={state.message} type={state.status} />}

      {confirmDelete && state.status !== "success" && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setConfirmDelete(false); }}>
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby={`delete-campaign-${id}`}>
            <button className={styles.close} type="button" onClick={() => setConfirmDelete(false)} disabled={pending} aria-label="Fechar confirmação"><X size={18} /></button>
            <Trash2 size={24} />
            <h2 id={`delete-campaign-${id}`}>Excluir campanha?</h2>
            <p>A campanha será removida. Os eventos de métricas futuros vinculados a ela também usarão a regra de remoção definida no banco.</p>
            <div><button type="button" onClick={() => setConfirmDelete(false)} disabled={pending}>Cancelar</button><form action={action}><input type="hidden" name="id" value={id} /><button className={styles.confirmDelete} name="operation" value="delete" type="submit" disabled={pending}>Excluir definitivamente</button></form></div>
          </section>
        </div>
      )}
    </div>
  );
}
