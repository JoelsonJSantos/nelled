"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { MediaPicker } from "@/components/admin/media-picker";
import { mergeMedia, type MediaItem } from "@/lib/media";

import { BlogEditor } from "./blog-editor";
import styles from "./blog-form.module.css";

type BlogCategory = { id: string; name: string };
type BlogContent = { html?: string; json?: Record<string, unknown>; coverImage?: string; coverAlt?: string };
type BlogSeo = { title?: string; description?: string; image?: string };
type BlogRecord = {
  id?: string;
  title?: string;
  slug?: string;
  summary?: string | null;
  category_id?: string | null;
  content?: unknown;
  seo?: unknown;
  status?: string;
  featured?: boolean;
  published_at?: string | null;
};
type Props = {
  record?: BlogRecord;
  categories: BlogCategory[];
  initialMedia: MediaItem[];
  action: (formData: FormData) => Promise<void>;
};

function getContent(value: unknown): BlogContent {
  return value && typeof value === "object" ? value as BlogContent : {};
}

function getSeo(value: unknown): BlogSeo {
  return value && typeof value === "object" ? value as BlogSeo : {};
}

function createSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function BlogForm({ record, categories, initialMedia, action }: Props) {
  const content = getContent(record?.content);
  const seo = getSeo(record?.seo);
  const [slug, setSlug] = useState(record?.slug ?? "");
  const slugTouched = useRef(Boolean(record));
  const [media, setMedia] = useState(initialMedia);
  const [coverImage, setCoverImage] = useState(content.coverImage ?? "");
  const [ogImage, setOgImage] = useState(seo.image ?? "");
  const [editorHtml, setEditorHtml] = useState(content.html ?? "");
  const [editorJson, setEditorJson] = useState(JSON.stringify(content.json ?? { type: "doc", content: [] }));

  function addMedia(items: MediaItem[]) {
    setMedia((current) => mergeMedia(current, items));
  }

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="id" value={record?.id ?? ""} />
      <input type="hidden" name="contentHtml" value={editorHtml} />
      <input type="hidden" name="contentJson" value={editorJson} />

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>01</span>
          <div><h2>Identificação</h2><p>Dados principais utilizados na listagem e identificação do artigo.</p></div>
        </header>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Título</span>
            <input name="title" required defaultValue={record?.title ?? ""} onChange={(event) => { if (!slugTouched.current) setSlug(createSlug(event.target.value)); }} />
          </label>
          <label className={styles.field}>
            <span>Slug</span>
            <input name="slug" required value={slug} onChange={(event) => { setSlug(event.target.value); slugTouched.current = true; }} />
          </label>
          <label className={`${styles.field} ${styles.full}`}>
            <span>Resumo</span>
            <textarea name="summary" rows={4} maxLength={320} defaultValue={record?.summary ?? ""} />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>02</span>
          <div><h2>Conteúdo</h2><p>Escreva e formate o conteúdo principal exibido na página pública.</p></div>
        </header>
        <div className={styles.editorField}>
          <BlogEditor
            initialHtml={content.html}
            media={media}
            context="blog"
            onMediaUploaded={addMedia}
            onChange={(value) => { setEditorHtml(value.html); setEditorJson(JSON.stringify(value.json)); }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>03</span>
          <div><h2>Publicação</h2><p>Controle o status, a data, o destaque e a categoria do artigo.</p></div>
        </header>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Status</span>
            <select name="status" defaultValue={record?.status ?? "draft"}>
              <option value="draft">Rascunho</option>
              <option value="scheduled">Agendado</option>
              <option value="published">Publicado</option>
              <option value="archived">Arquivado</option>
            </select>
          </label>
          <label className={styles.field}>
            <span>Data de publicação</span>
            <input name="publishedAt" type="datetime-local" defaultValue={record?.published_at?.slice(0, 16) ?? ""} />
          </label>
          <div className={styles.categoryField}>
            <label className={styles.field}>
              <span>Categoria</span>
              <select name="categoryId" defaultValue={record?.category_id ?? ""}>
                <option value="">Sem categoria</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
            </label>
            <Link className={styles.categoryLink} href="/admin/blog/categorias">Gerenciar categorias</Link>
          </div>
          <label className={styles.check}>
            <input name="featured" type="checkbox" defaultChecked={record?.featured} />
            <span>Destacar artigo</span>
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>04</span>
          <div><h2>Mídia</h2><p>Selecione a imagem destacada usada na listagem e no artigo.</p></div>
        </header>
        <div className={styles.mediaFields}>
          <MediaPicker name="coverImage" label="Capa do artigo" media={media} context="blog" multiple={false} value={coverImage} onChange={(value) => setCoverImage(typeof value === "string" ? value : value[0] ?? "")} onMediaUploaded={addMedia} />
          <label className={styles.field}>
            <span>Texto alternativo</span>
            <input name="coverAlt" defaultValue={content.coverAlt ?? ""} placeholder="Descreva a imagem" />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeading}>
          <span>05</span>
          <div><h2>SEO</h2><p>Configure os metadados já utilizados pelo artigo nas buscas e compartilhamentos.</p></div>
        </header>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Título SEO</span>
            <input name="seoTitle" defaultValue={seo.title ?? ""} />
          </label>
          <label className={styles.field}>
            <span>Descrição SEO</span>
            <textarea name="seoDescription" rows={3} maxLength={180} defaultValue={seo.description ?? ""} />
          </label>
          <div className={styles.full}>
            <MediaPicker name="seoImage" label="Imagem Open Graph" media={media} context="blog" multiple={false} value={ogImage} onChange={(value) => setOgImage(typeof value === "string" ? value : value[0] ?? "")} onMediaUploaded={addMedia} />
          </div>
        </div>
      </section>

      <div className={styles.footer}>
        <Link href="/admin/blog" className={styles.cancel}>Cancelar</Link>
        <button className={styles.submit} type="submit">Salvar artigo</button>
      </div>
    </form>
  );
}
