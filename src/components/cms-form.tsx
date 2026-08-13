"use client";

import { useState } from "react";
import styles from "./cms-form.module.css";

type RecordData = {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  category?: string | null;
  excerpt?: string | null;
  summary?: string | null;
  status?: string;
  year?: number | null;
  technologies?: string[];
  featured?: boolean;
  sort_order?: number;
  content?: unknown;
  seo?: unknown;
  short_description?: string | null;
  active?: boolean;
  website_url?: string | null;
  affiliate_url?: string | null;
  coupon?: string | null;
  published_at?: string | null;
};

function value(input: unknown) { return typeof input === "string" ? input : ""; }
function content(data: RecordData) {
  if (typeof data.content !== "object" || !data.content) return "";
  const document = data.content as { body?: string; html?: string };
  return value(document.body ?? document.html);
}

export function CmsForm({ kind, record, action }: {
  kind: "project" | "post" | "partner";
  record?: RecordData;
  action: (formData: FormData) => Promise<void>;
}) {
  const [slug, setSlug] = useState(record?.slug ?? "");
  const title = record?.name ?? record?.title ?? "";

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <label>{kind === "post" ? "Título" : "Nome"}<input name={kind === "post" ? "title" : "name"} required defaultValue={title} onChange={(event) => {
        if (!record) setSlug(event.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      }} /></label>
      <label>Slug<input name="slug" required value={slug} onChange={(event) => setSlug(event.target.value)} /></label>

      {kind === "project" && <>
        <label>Categoria<input name="category" defaultValue={record?.category ?? ""} /></label>
        <label>Ano<input name="year" type="number" min="2000" max="2100" defaultValue={record?.year ?? ""} /></label>
        <label className={styles.wide}>Descrição curta<textarea name="excerpt" defaultValue={record?.excerpt ?? ""} rows={3} /></label>
        <label className={styles.wide}>Tecnologias (separadas por vírgula)<input name="technologies" defaultValue={record?.technologies?.join(", ") ?? ""} /></label>
      </>}

      {kind === "post" && <label className={styles.wide}>Resumo<textarea name="summary" defaultValue={record?.summary ?? ""} rows={3} /></label>}

      {kind === "partner" && <>
        <label className={styles.wide}>Descrição curta<textarea name="shortDescription" defaultValue={record?.short_description ?? ""} rows={3} /></label>
        <label>Site<input name="websiteUrl" type="url" defaultValue={record?.website_url ?? ""} /></label>
        <label>Link afiliado<input name="affiliateUrl" type="url" defaultValue={record?.affiliate_url ?? ""} /></label>
        <label>Cupom<input name="coupon" defaultValue={record?.coupon ?? ""} /></label>
      </>}

      <label className={styles.wide}>{kind === "post" ? "Conteúdo" : "Descrição completa"}<textarea name="content" required rows={10} defaultValue={content(record ?? {})} /></label>
      <label>Status<select name="status" defaultValue={record?.status ?? "draft"}>{kind === "post" && <option value="scheduled">Agendado</option>}<option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
      {kind === "post" && <label>Publicação<input name="publishedAt" type="datetime-local" defaultValue={record?.published_at?.slice(0, 16) ?? ""} /></label>}
      <label>Ordem<input name="sortOrder" type="number" min="0" defaultValue={record?.sort_order ?? 0} /></label>
      <label className={styles.check}><input name="featured" type="checkbox" defaultChecked={record?.featured} /><span>Destacar na home</span></label>
      {kind === "partner" && <label className={styles.check}><input name="active" type="checkbox" defaultChecked={record?.active ?? true} /><span>Parceiro ativo</span></label>}

      <fieldset className={styles.wide}>
        <legend>SEO</legend>
        <label>Título SEO<input name="seoTitle" defaultValue={typeof record?.seo === "object" && record.seo ? value((record.seo as { title?: string }).title) : ""} /></label>
        <label>Descrição SEO<textarea name="seoDescription" rows={3} defaultValue={typeof record?.seo === "object" && record.seo ? value((record.seo as { description?: string }).description) : ""} /></label>
      </fieldset>
      <button className={styles.submit} type="submit">Salvar alterações</button>
    </form>
  );
}
