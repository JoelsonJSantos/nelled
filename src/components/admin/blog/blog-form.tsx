"use client";

import {
  useState,
} from "react";
import Link from "next/link";

import { BlogEditor } from "./blog-editor";

import { MediaPicker } from "@/components/admin/media-picker";

import type {
  MediaItem,
} from "@/lib/media";

import styles from "./blog-form.module.css";

type BlogCategory = {
  id: string;
  name: string;
};

type BlogContent = {
  html?: string;
  json?: Record<
    string,
    unknown
  >;
  coverImage?: string;
  coverAlt?: string;
};

type BlogSeo = {
  title?: string;
  description?: string;
  image?: string;
};

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

  action: (
    formData: FormData,
  ) => Promise<void>;
};

function getContent(
  value: unknown,
): BlogContent {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {};
  }

  return value as BlogContent;
}

function getSeo(
  value: unknown,
): BlogSeo {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {};
  }

  return value as BlogSeo;
}

function createSlug(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /(^-|-$)/g,
      "",
    );
}

export function BlogForm({
  record,
  categories,
  initialMedia,
  action,
}: Props) {
  const content =
    getContent(
      record?.content,
    );

  const seo =
    getSeo(
      record?.seo,
    );

  const [
    slug,
    setSlug,
  ] = useState(
    record?.slug ?? "",
  );

  const [
    slugTouched,
    setSlugTouched,
  ] = useState(
    Boolean(record),
  );

  const [
    media,
    setMedia,
  ] = useState(
    initialMedia,
  );

  const [
    coverImage,
    setCoverImage,
  ] = useState(
    content.coverImage ?? "",
  );

  const [
    ogImage,
    setOgImage,
  ] = useState(
    seo.image ?? "",
  );

  const [
    editorHtml,
    setEditorHtml,
  ] = useState(
    content.html ?? "",
  );

  const [
    editorJson,
    setEditorJson,
  ] = useState(
    JSON.stringify(
      content.json ?? {
        type: "doc",
        content: [],
      },
    ),
  );

  function addMedia(
    items: MediaItem[],
  ) {
    setMedia(
      (current) => {
        const next = [
          ...items,
          ...current,
        ];

        return next.filter(
          (
            item,
            index,
            all,
          ) =>
            all.findIndex(
              (other) =>
                other.id ===
                item.id,
            ) === index,
        );
      },
    );
  }

  return (
    <form
      action={action}
      className={styles.form}
    >
      <input
        type="hidden"
        name="id"
        value={
          record?.id ?? ""
        }
      />

      <input
        type="hidden"
        name="contentHtml"
        value={editorHtml}
      />

      <input
        type="hidden"
        name="contentJson"
        value={editorJson}
      />

      <section
        className={
          styles.main
        }
      >
        <label
          className={
            styles.field
          }
        >
          <span>Título</span>

          <input
            name="title"
            required
            defaultValue={
              record?.title ??
              ""
            }
            onChange={(
              event,
            ) => {
              if (
                !slugTouched
              ) {
                setSlug(
                  createSlug(
                    event.target
                      .value,
                  ),
                );
              }
            }}
          />
        </label>

        <label
          className={
            styles.field
          }
        >
          <span>Slug</span>

          <input
            name="slug"
            required
            value={slug}
            onChange={(
              event,
            ) => {
              setSlug(
                event.target
                  .value,
              );

              setSlugTouched(
                true,
              );
            }}
          />
        </label>

        <label
          className={
            styles.field
          }
        >
          <span>Resumo</span>

          <textarea
            name="summary"
            rows={4}
            maxLength={320}
            defaultValue={
              record?.summary ??
              ""
            }
          />
        </label>

        <div
          className={
            styles.editorField
          }
        >
          <span>
            Conteúdo
          </span>

          <BlogEditor
            initialHtml={
              content.html
            }
            media={media}
            context="blog"
            onMediaUploaded={
              addMedia
            }
            onChange={(
              value,
            ) => {
              setEditorHtml(
                value.html,
              );

              setEditorJson(
                JSON.stringify(
                  value.json,
                ),
              );
            }}
          />
        </div>

        <fieldset
          className={
            styles.seo
          }
        >
          <legend>SEO</legend>

          <label
            className={
              styles.field
            }
          >
            <span>
              Título SEO
            </span>

            <input
              name="seoTitle"
              defaultValue={
                seo.title ?? ""
              }
            />
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Descrição SEO
            </span>

            <textarea
              name="seoDescription"
              rows={3}
              maxLength={180}
              defaultValue={
                seo.description ??
                ""
              }
            />
          </label>

          <MediaPicker
            name="seoImage"
            label="Imagem Open Graph"
            media={media}
            context="blog"
            multiple={false}
            value={ogImage}
            onChange={(
              value,
            ) =>
              setOgImage(
                typeof value ===
                  "string"
                  ? value
                  : value[0] ??
                      "",
              )
            }
            onMediaUploaded={
              addMedia
            }
          />
        </fieldset>
      </section>

      <aside
        className={
          styles.sidebar
        }
      >
        <div
          className={
            styles.sidePanel
          }
        >
          <h2>Publicação</h2>

          <label
            className={
              styles.field
            }
          >
            <span>Status</span>

            <select
              name="status"
              defaultValue={
                record?.status ??
                "draft"
              }
            >
              <option value="draft">
                Rascunho
              </option>

              <option value="scheduled">
                Agendado
              </option>

              <option value="published">
                Publicado
              </option>

              <option value="archived">
                Arquivado
              </option>
            </select>
          </label>

          <label
            className={
              styles.field
            }
          >
            <span>
              Data de publicação
            </span>

            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={
                record?.published_at
                  ?.slice(
                    0,
                    16,
                  ) ?? ""
              }
            />
          </label>

          <label
            className={
              styles.checkbox
            }
          >
            <input
              name="featured"
              type="checkbox"
              defaultChecked={
                record?.featured
              }
            />

            <span>
              Destacar artigo
            </span>
          </label>
        </div>

        <div
          className={
            styles.sidePanel
          }
        >
          <h2>Categoria</h2>

          <label
            className={
              styles.field
            }
          >
            <span>
              Categoria
            </span>

            <select
              name="categoryId"
              defaultValue={
                record?.category_id ??
                ""
              }
            >
              <option value="">
                Sem categoria
              </option>

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    value={
                      category.id
                    }
                    key={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <Link
            className={styles.categoryLink}
            href="/admin/blog/categorias"
          >
            Gerenciar categorias
          </Link>
        </div>

        <div
          className={
            styles.sidePanel
          }
        >
          <h2>
            Imagem destacada
          </h2>

          <MediaPicker
            name="coverImage"
            label="Capa do artigo"
            media={media}
            context="blog"
            multiple={false}
            value={coverImage}
            onChange={(
              value,
            ) =>
              setCoverImage(
                typeof value ===
                  "string"
                  ? value
                  : value[0] ??
                      "",
              )
            }
            onMediaUploaded={
              addMedia
            }
          />

          <label
            className={
              styles.field
            }
          >
            <span>
              Texto alternativo
            </span>

            <input
              name="coverAlt"
              defaultValue={
                content.coverAlt ??
                ""
              }
              placeholder="Descreva a imagem"
            />
          </label>
        </div>

        <button
          className={
            styles.submit
          }
          type="submit"
        >
          Salvar artigo
        </button>
      </aside>
    </form>
  );
}
