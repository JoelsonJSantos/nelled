"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Archive, Edit3, Eye, EyeOff, LoaderCircle, Send, Trash2, X } from "lucide-react";

import { deleteRecord, quickPostAction } from "@/app/admin/actions";
import { AdminToast } from "@/components/admin/admin-toast";
import { initialBlogActionState } from "@/lib/blog-action-state";

import styles from "../project-row-actions.module.css";

export function BlogRowActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [actionId, setActionId] = useState(0);
  const [state, action, pending] = useActionState(quickPostAction, initialBlogActionState);

  useEffect(() => {
    if (state.status === "success") router.refresh();
  }, [router, state.status]);

  return (
    <div className={styles.wrap} onSubmitCapture={() => setActionId((current) => current + 1)}>
      <div className={styles.actions} aria-label="Ações do artigo">
        <Link href={`/admin/blog/${id}`} title="Editar artigo"><Edit3 size={15} /><span>Editar</span></Link>
        {status === "published" ? (
          <Link href={`/blog/${slug}`} target="_blank" rel="noreferrer" title="Visualizar artigo"><Eye size={15} /><span>Ver</span></Link>
        ) : (
          <span className={styles.disabled} title="Publique para visualizar"><EyeOff size={15} /><span>Ver</span></span>
        )}
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          {status === "published" ? (
            <button name="operation" value="unpublish" type="submit" disabled={pending} title="Retirar publicação"><EyeOff size={15} /><span>Retirar</span></button>
          ) : (
            <button name="operation" value="publish" type="submit" disabled={pending} title="Publicar"><Send size={15} /><span>Publicar</span></button>
          )}
          {status !== "archived" && <button name="operation" value="archive" type="submit" disabled={pending} title="Arquivar"><Archive size={15} /><span>Arquivar</span></button>}
        </form>
        <button className={styles.deleteButton} type="button" onClick={() => setConfirmDelete(true)} title="Excluir"><Trash2 size={15} /><span>Excluir</span></button>
      </div>

      {pending && <span className={styles.pending}><LoaderCircle size={14} />Processando…</span>}
      {!pending && state.status !== "idle" && <AdminToast key={`${actionId}-${state.status}-${state.message}`} message={state.message} type={state.status} />}

      {confirmDelete && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setConfirmDelete(false);
        }}>
          <section className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby={`delete-post-${id}`}>
            <button className={styles.close} type="button" onClick={() => setConfirmDelete(false)} aria-label="Fechar confirmação"><X size={18} /></button>
            <Trash2 size={24} />
            <h2 id={`delete-post-${id}`}>Excluir artigo?</h2>
            <p>Esta ação remove o artigo permanentemente e não pode ser desfeita.</p>
            <div>
              <button type="button" onClick={() => setConfirmDelete(false)}>Cancelar</button>
              <form action={deleteRecord}>
                <input type="hidden" name="table" value="blog_posts" />
                <input type="hidden" name="id" value={id} />
                <button className={styles.confirmDelete} type="submit">Excluir definitivamente</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
