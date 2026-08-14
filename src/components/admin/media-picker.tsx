"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Images, Search, Trash2, UploadCloud, X } from "lucide-react";
import { mediaName, type MediaContext, type MediaItem } from "@/lib/media";
import { MediaUploader } from "./media-uploader";
import styles from "./media-picker.module.css";

type MediaPickerProps = {
  name: string;
  label: string;
  media: MediaItem[];
  context: MediaContext;
  multiple?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onMediaUploaded?: (media: MediaItem[]) => void;
  error?: string;
};

export function MediaPicker({ name, label, media, context, multiple = false, value, onChange, onMediaUploaded, error }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const [draft, setDraft] = useState(values);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return media.filter((item) => !query || `${mediaName(item)} ${item.publicId}`.toLocaleLowerCase("pt-BR").includes(query));
  }, [media, search]);

  function openPicker() {
    setDraft(values);
    setOpen(true);
  }

  function select(item: MediaItem) {
    if (!multiple) {
      onChange(item.url);
      setOpen(false);
      return;
    }
    setDraft((current) => current.includes(item.url) ? current.filter((url) => url !== item.url) : [...current, item.url].slice(0, 20));
  }

  function removeAt(index: number) {
    const next = values.filter((_, itemIndex) => itemIndex !== index);
    onChange(multiple ? next : "");
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function uploaded(items: MediaItem[]) {
    onMediaUploaded?.(items);
    if (multiple) onChange([...values, ...items.map((item) => item.url)].filter((url, index, all) => all.indexOf(url) === index).slice(0, 20));
    else onChange(items[0]?.url ?? "");
  }

  return (
    <div className={styles.field}>
      <div className={styles.label}><strong>{label}</strong><span>{multiple ? "até 20 imagens" : "uma imagem"}</span></div>
      {values.length > 0 ? (
        <div className={`${styles.previewGrid} ${multiple ? "" : styles.single}`}>
          {values.map((url, index) => (
            <div className={styles.preview} key={`${url}-${index}`}>
              <Image src={url} alt={`${label}, imagem ${index + 1}`} fill sizes={multiple ? "180px" : "360px"} unoptimized={url.startsWith("https://")} />
              <div className={styles.previewActions}>
                {multiple && <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Mover imagem para a esquerda"><ChevronLeft size={15} /></button>}
                {multiple && <button type="button" onClick={() => move(index, 1)} disabled={index === values.length - 1} aria-label="Mover imagem para a direita"><ChevronRight size={15} /></button>}
                <button type="button" onClick={() => removeAt(index)} aria-label="Remover imagem"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className={styles.emptyPreview}><Images size={22} /><span>Nenhuma imagem selecionada</span></div>}

      <input type="hidden" name={name} value={multiple ? values.join("\n") : values[0] ?? ""} />
      {error && <small className={styles.error}>{error}</small>}
      <div className={styles.controls}>
        <button type="button" className={styles.libraryButton} onClick={openPicker}><ImagePlus size={17} />Selecionar da biblioteca</button>
        <MediaUploader context={context} multiple={multiple} compact onUploaded={uploaded} />
      </div>

      {open && (
        <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={`${name}-picker-title`}>
            <div className={styles.dialogHeader}>
              <div><p>BIBLIOTECA DE MÍDIA</p><h2 id={`${name}-picker-title`}>Selecionar {multiple ? "imagens" : "imagem"}</h2></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar seletor"><X size={19} /></button>
            </div>
            <label className={styles.search}><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar mídia" autoFocus /></label>
            {filtered.length ? (
              <div className={styles.libraryGrid}>
                {filtered.map((item) => {
                  const selected = draft.includes(item.url);
                  return <button type="button" className={selected ? styles.selected : ""} onClick={() => select(item)} key={item.id}><span><Image src={item.url} alt={item.altText || mediaName(item)} fill sizes="180px" unoptimized /></span><strong>{mediaName(item)}</strong>{selected && <i>Selecionada</i>}</button>;
                })}
              </div>
            ) : <div className={styles.dialogEmpty}><UploadCloud size={24} /><p>Nenhuma mídia encontrada.</p></div>}
            {multiple && <div className={styles.dialogFooter}><span>{draft.length} selecionada{draft.length === 1 ? "" : "s"}</span><button type="button" onClick={() => { onChange(draft); setOpen(false); }}>Usar selecionadas</button></div>}
          </div>
        </div>
      )}
    </div>
  );
}
