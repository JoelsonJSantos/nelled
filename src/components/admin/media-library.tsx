"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { FileImage, Search, Trash2, X } from "lucide-react";
import { deleteMedia } from "@/app/admin/midias/actions";
import { AdminToast } from "@/components/admin/admin-toast";
import { formatMediaBytes, mediaName, mergeMedia, type MediaItem } from "@/lib/media";
import { MediaUploader } from "./media-uploader";
import styles from "./media-library.module.css";

type MediaLibraryProps = {
  initialMedia: MediaItem[];
  loadError?: string;
};

export function MediaLibrary({ initialMedia, loadError }: MediaLibraryProps) {
  const [media, setMedia] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState("all");
  const [feedback, setFeedback] = useState<{ id: number; message: string; type: "success" | "error" } | null>(loadError ? { id: 0, message: loadError, type: "error" } : null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return media.filter((item) => {
      const matchesSearch = !query || `${mediaName(item)} ${item.publicId}`.toLocaleLowerCase("pt-BR").includes(query);
      const matchesFormat = format === "all" || item.mimeType === format;
      return matchesSearch && matchesFormat;
    });
  }, [format, media, search]);

  function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      const result = await deleteMedia(target.id);
      setFeedback({ id: Date.now(), message: result.message, type: result.status });
      if (result.status === "success") {
        setMedia((current) => current.filter((item) => item.id !== target.id));
        setDeleteTarget(null);
      }
    });
  }

  return (
    <div className={styles.library}>
      <section id="envio" className={styles.uploadPanel}>
        <div className={styles.panelHeading}>
          <div><p>UPLOAD SEGURO</p><h2>Enviar imagens</h2></div>
          <span>Os arquivos são assinados e organizados em nelled-studio/site.</span>
        </div>
        <MediaUploader context="site" multiple onUploaded={(items) => {
          setMedia((current) => mergeMedia(current, items));
          setFeedback({ id: Date.now(), message: `${items.length} ${items.length === 1 ? "imagem enviada" : "imagens enviadas"} com sucesso.`, type: "success" });
        }} />
      </section>

      {feedback && <AdminToast key={feedback.id} message={feedback.message} type={feedback.type} />}

      <section className={styles.browser}>
        <div className={styles.browserHeading}>
          <div><p>BIBLIOTECA</p><h2>{media.length} {media.length === 1 ? "arquivo" : "arquivos"}</h2></div>
          <div className={styles.filters}>
            <label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar mídia" /></label>
            <select value={format} onChange={(event) => setFormat(event.target.value)} aria-label="Filtrar por formato">
              <option value="all">Todos os formatos</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
              <option value="image/avif">AVIF</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((item) => (
              <article className={styles.card} key={item.id}>
                <div className={styles.thumbnail}><Image src={item.url} alt={item.altText || "Mídia da Nelled Studio"} fill sizes="(max-width: 680px) 50vw, 240px" unoptimized /></div>
                <div className={styles.cardInfo}>
                  <div><strong>{mediaName(item)}</strong><span>{item.mimeType.replace("image/", "").toUpperCase()} · {formatMediaBytes(item.bytes)}</span></div>
                  <button type="button" onClick={() => setDeleteTarget(item)} aria-label={`Excluir ${mediaName(item)}`}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}><FileImage size={28} /><h3>{media.length ? "Nenhuma mídia encontrada" : "Biblioteca vazia"}</h3><p>{media.length ? "Ajuste a busca ou o filtro." : "Envie a primeira imagem para começar."}</p></div>
        )}
      </section>

      {deleteTarget && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !pending) setDeleteTarget(null); }}>
          <div className={styles.modal} role="alertdialog" aria-modal="true" aria-labelledby="delete-media-title">
            <button className={styles.modalClose} type="button" onClick={() => setDeleteTarget(null)} disabled={pending} aria-label="Fechar"><X size={18} /></button>
            <Trash2 size={22} />
            <h2 id="delete-media-title">Excluir mídia?</h2>
            <p>“{mediaName(deleteTarget)}” será removida do Cloudinary e da biblioteca. Se estiver em uso, a exclusão será bloqueada.</p>
            <div><button type="button" onClick={() => setDeleteTarget(null)} disabled={pending}>Cancelar</button><button type="button" onClick={confirmDelete} disabled={pending}>{pending ? "Verificando…" : "Excluir mídia"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
