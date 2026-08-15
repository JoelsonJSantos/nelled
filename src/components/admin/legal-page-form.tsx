"use client";

import { Save } from "lucide-react";
import { useState } from "react";

import {
  BlogEditor,
  type BlogEditorValue,
} from "@/components/admin/blog/blog-editor";
import styles from "@/components/admin/admin-ui.module.css";
import type { MediaItem } from "@/lib/media";
import type { LegalPageContent } from "@/lib/site-settings";

type LegalPageKey =
  | "termos-de-uso"
  | "politica-de-privacidade"
  | "politica-de-cookies";

type Props = {
  pageKey: LegalPageKey;
  content: LegalPageContent;
  initialMedia: MediaItem[];
  action: (formData: FormData) => Promise<void>;
};

export function LegalPageForm({
  pageKey,
  content,
  initialMedia,
  action,
}: Props) {
  const [editorValue, setEditorValue] = useState<BlogEditorValue>({
    html: content.html,
    json: {},
  });

  const [media, setMedia] = useState(initialMedia);

  return (
    <form action={action} className={styles.settingsForm}>
      <input type="hidden" name="pageKey" value={pageKey} />
      <input type="hidden" name="html" value={editorValue.html} />

      <div className={styles.settingsGrid}>
        <section className={styles.settingsCard}>
          <div>
            <h2>Apresentação</h2>
            <p>Textos exibidos no topo da página</p>
          </div>

          <label className={styles.settingsField}>
            Eyebrow
            <input
              name="eyebrow"
              required
              maxLength={180}
              defaultValue={content.eyebrow}
            />
          </label>

          <label className={styles.settingsField}>
            Título
            <input
              name="title"
              required
              maxLength={180}
              defaultValue={content.title}
            />
          </label>

          <label className={styles.settingsField}>
            Descrição
            <textarea
              name="description"
              required
              rows={4}
              maxLength={500}
              defaultValue={content.description}
            />
          </label>
        </section>

        <section className={styles.settingsCard}>
          <div>
            <h2>SEO</h2>
            <p>Informações exibidas em mecanismos de busca</p>
          </div>

          <label className={styles.settingsField}>
            Título SEO
            <input
              name="seoTitle"
              required
              maxLength={180}
              defaultValue={content.seoTitle}
            />
          </label>

          <label className={styles.settingsField}>
            Descrição SEO
            <textarea
              name="seoDescription"
              required
              rows={4}
              maxLength={320}
              defaultValue={content.seoDescription}
            />
          </label>
        </section>
      </div>

      <section className={`${styles.settingsCard} ${styles.settingsCardFull}`}>
        <div>
          <h2>Conteúdo da página</h2>
          <p>
            Use títulos, listas, links, tabelas e outros recursos para organizar o texto.
          </p>
        </div>

        <BlogEditor
          initialHtml={content.html}
          media={media}
          context="site"
          onMediaUploaded={(items) => {
            setMedia((current) => {
              const next = [...items, ...current];
              const seen = new Set<string>();

              return next.filter((item) => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
              });
            });
          }}
          onChange={setEditorValue}
        />

        <p className={styles.pageEditorHint}>
          Você pode usar os tokens {"{company}"}, {"{email}"} e {"{domain}"} no
          conteúdo. Eles serão substituídos automaticamente no site público.
        </p>
      </section>

      <div className={styles.settingsSaveBar}>
        <div>
          <strong>Conteúdo legal</strong>
          <span>As alterações serão aplicadas imediatamente ao site público.</span>
        </div>

        <button type="submit" className={styles.settingsSaveButton}>
          <Save size={16} />
          Salvar página
        </button>
      </div>
    </form>
  );
}
