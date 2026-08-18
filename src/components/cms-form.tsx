"use client";

import Link from "next/link";
import { useState } from "react";

import { BlogEditor } from "@/components/admin/blog/blog-editor";
import { legacyTextOrHtmlToEditorHtml } from "@/lib/sanitize-rich-text";

import styles from "./cms-form.module.css";

type RecordData = {
  id?: string;
  name?: string;
  slug?: string;
  sort_order?: number;
  content?: unknown;
  seo?: unknown;
  short_description?: string | null;
  active?: boolean;
  featured?: boolean;
  website_url?: string | null;
  affiliate_url?: string | null;
  coupon?: string | null;
};

function value(input: unknown) {
  return typeof input === "string" ? input : "";
}

function partnerContent(data: RecordData) {
  if (typeof data.content !== "object" || !data.content) return "";

  const document = data.content as { body?: string; html?: string };
  return value(document.html ?? document.body);
}

function seoValue(data: RecordData, key: "title" | "description") {
  if (typeof data.seo !== "object" || !data.seo) return "";
  return value((data.seo as Record<string, unknown>)[key]);
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CmsForm({
  kind,
  record,
  action,
}: {
  kind: "partner";
  record?: RecordData;
  action: (formData: FormData) => Promise<void>;
}) {
  const [slug, setSlug] = useState(record?.slug ?? "");
  const initialContent = legacyTextOrHtmlToEditorHtml(partnerContent(record ?? {}));
  const [contentHtml, setContentHtml] = useState(initialContent);

  return (
    <form action={action} className={styles.form} data-kind={kind}>
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <input type="hidden" name="content" value={contentHtml} />

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <h2>Identificação</h2>
            <p>Defina como o parceiro será identificado e organizado no ecossistema.</p>
          </div>
        </header>

        <div className={styles.fields}>
          <label>
            <span>Nome</span>
            <input
              name="name"
              required
              defaultValue={record?.name ?? ""}
              onChange={(event) => {
                if (!record) setSlug(createSlug(event.target.value));
              }}
            />
          </label>
          <label>
            <span>Slug</span>
            <input name="slug" required value={slug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <label>
            <span>Ordem de exibição</span>
            <input name="sortOrder" type="number" min="0" defaultValue={record?.sort_order ?? 0} />
          </label>
          <div className={styles.checkGroup}>
            <label className={styles.check}>
              <input name="active" type="checkbox" defaultChecked={record?.active ?? true} />
              <span>Parceiro ativo</span>
            </label>
            <label className={styles.check}>
              <input name="featured" type="checkbox" defaultChecked={record?.featured} />
              <span>Destacar na Home</span>
            </label>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h2>Conteúdo</h2>
            <p>A descrição curta aparece na listagem; a completa é usada na página pública do parceiro.</p>
          </div>
        </header>

        <label className={styles.full}>
          <span>Descrição curta</span>
          <textarea name="shortDescription" rows={3} maxLength={320} defaultValue={record?.short_description ?? ""} />
        </label>

        <div className={styles.editorField}>
          <span>Descrição completa</span>
          <small>Use parágrafos, títulos, listas, links e formatações para organizar a apresentação.</small>
          <BlogEditor compact initialHtml={initialContent} onChange={(editorValue) => setContentHtml(editorValue.html)} />
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>Comercial</h2>
            <p>Informe links e benefícios que podem ser apresentados ao visitante.</p>
          </div>
        </header>

        <div className={styles.fields}>
          <label>
            <span>Site</span>
            <input name="websiteUrl" type="url" defaultValue={record?.website_url ?? ""} placeholder="https://" />
          </label>
          <label>
            <span>Link afiliado</span>
            <input name="affiliateUrl" type="url" defaultValue={record?.affiliate_url ?? ""} placeholder="https://" />
          </label>
          <label className={styles.full}>
            <span>Cupom</span>
            <input name="coupon" defaultValue={record?.coupon ?? ""} placeholder="Ex.: NELLED10" />
          </label>
        </div>
      </section>

      <fieldset className={styles.seo}>
        <legend>SEO</legend>
        <label>
          <span>Título SEO</span>
          <input name="seoTitle" defaultValue={seoValue(record ?? {}, "title")} />
        </label>
        <label>
          <span>Descrição SEO</span>
          <textarea name="seoDescription" rows={3} maxLength={320} defaultValue={seoValue(record ?? {}, "description")} />
        </label>
      </fieldset>

      <div className={styles.footer}>
        <Link href="/admin/parceiros" className={styles.cancel}>Cancelar</Link>
        <button className={styles.submit} type="submit">Salvar parceiro</button>
      </div>
    </form>
  );
}
