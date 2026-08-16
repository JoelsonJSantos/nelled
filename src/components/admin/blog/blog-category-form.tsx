"use client";

import { useState } from "react";

import { normalizeSlug } from "@/lib/portfolio";

import styles from "./blog-category-form.module.css";

type BlogCategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export function BlogCategoryForm({
  category,
  action,
}: {
  category?: BlogCategoryRecord;
  action: (formData: FormData) => Promise<void>;
}) {
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(category));

  return (
    <form action={action} className={styles.form}>
      <input name="id" type="hidden" value={category?.id ?? ""} />

      <div className={styles.heading}>
        <p>{category ? "Editar categoria" : "Nova categoria"}</p>
        <span>
          {category
            ? "Atualize o nome, a URL e a descrição usada no Blog."
            : "Crie uma categoria para organizar os artigos do Blog."}
        </span>
      </div>

      <label className={styles.field}>
        <span>Nome</span>
        <input
          name="name"
          required
          defaultValue={category?.name ?? ""}
          onChange={(event) => {
            if (!slugEdited) {
              setSlug(normalizeSlug(event.target.value));
            }
          }}
        />
      </label>

      <label className={styles.field}>
        <span>Slug</span>
        <input
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlug(normalizeSlug(event.target.value));
            setSlugEdited(true);
          }}
        />
        <small>Usado na URL pública: /blog/categoria/{slug || "categoria"}</small>
      </label>

      <label className={styles.field}>
        <span>Descrição</span>
        <textarea
          name="description"
          rows={4}
          maxLength={320}
          defaultValue={category?.description ?? ""}
        />
        <small>Opcional. Será usada como introdução e descrição SEO da categoria.</small>
      </label>

      <button className={styles.submit} type="submit">
        {category ? "Salvar categoria" : "Criar categoria"}
      </button>
    </form>
  );
}
