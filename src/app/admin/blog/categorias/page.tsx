import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FolderTree, Pencil, Trash2 } from "lucide-react";

import {
  deleteBlogCategory,
  saveBlogCategory,
} from "@/app/admin/actions";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { BlogCategoryForm } from "@/components/admin/blog/blog-category-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsSavedToast } from "@/components/admin/settings-saved-toast";
import styles from "@/components/admin/admin-ui.module.css";
import { requireAdmin } from "@/lib/admin";

import pageStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Gerenciamento das categorias usadas nos artigos do Blog.",
};

type SearchParams = Promise<{
  editar?: string | string[];
  message?: string | string[];
  status?: string | string[];
}>;

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

function valueFromSearchParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function getPostsCount(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) {
    return 0;
  }

  const count = Reflect.get(value[0], "count");
  return typeof count === "number" ? count : 0;
}

function stringValue(value: unknown, key: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const property = Reflect.get(value, key);
  return typeof property === "string" ? property : "";
}

function normalizeCategoryRow(value: unknown): (CategoryRow & { blog_posts?: unknown }) | null {
  const id = stringValue(value, "id");
  const name = stringValue(value, "name");
  const slug = stringValue(value, "slug");

  if (!id || !name || !slug) {
    return null;
  }

  const description = value && typeof value === "object" && !Array.isArray(value)
    ? Reflect.get(value, "description")
    : null;
  const posts = value && typeof value === "object" && !Array.isArray(value)
    ? Reflect.get(value, "blog_posts")
    : undefined;

  return {
    id,
    name,
    slug,
    description: typeof description === "string" ? description : null,
    blog_posts: posts,
  };
}

export default async function BlogCategoriesAdmin({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const editingId = valueFromSearchParam(params.editar);
  const message = valueFromSearchParam(params.message);
  const status = valueFromSearchParam(params.status);
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id,name,slug,description,blog_posts(count)")
    .order("name", { ascending: true });
  const categories = (data ?? [])
    .map(normalizeCategoryRow)
    .filter((category): category is CategoryRow & { blog_posts?: unknown } => category !== null);
  const editingCategory = categories.find((category) => category.id === editingId);
  const toastType = status === "error" ? "error" : "success";
  const toastMessage = message || (status === "deleted"
    ? "A categoria foi excluída com sucesso."
    : "As alterações da categoria foram salvas com sucesso.");
  const toastTitle = status === "error"
    ? "Não foi possível concluir"
    : status === "deleted"
      ? "Categoria excluída"
      : "Categoria salva";

  return (
    <>
      <SettingsSavedToast
        show={status === "saved" || status === "deleted" || status === "error"}
        title={toastTitle}
        message={toastMessage}
        type={toastType}
      />
      <AdminPageHeader
        eyebrow="Blog"
        title="Categorias"
        description="Organize os assuntos disponíveis para os artigos publicados."
        action={{ label: "Voltar aos artigos", href: "/admin/blog", icon: ArrowLeft }}
      />

      <div className={pageStyles.layout}>
        <section className={pageStyles.listSection} aria-labelledby="categories-list-title">
          <div className={pageStyles.sectionHeading}>
            <div>
              <p>Blog</p>
              <h2 id="categories-list-title">Categorias cadastradas</h2>
            </div>
            <span>{categories.length}</span>
          </div>

          {error ? (
            <p className={styles.queryError}>
              Não foi possível carregar as categorias. Tente novamente.
            </p>
          ) : categories.length > 0 ? (
            <div className={pageStyles.rows}>
              {categories.map((category) => {
                const postsCount = getPostsCount(category.blog_posts);

                return (
                  <article className={pageStyles.row} key={category.id}>
                    <div className={pageStyles.rowCopy}>
                      <strong>{category.name}</strong>
                      <span>/{category.slug}</span>
                      {category.description && <p>{category.description}</p>}
                    </div>

                    <span className={pageStyles.count}>
                      {postsCount} {postsCount === 1 ? "artigo" : "artigos"}
                    </span>

                    <div className={pageStyles.actions}>
                      <Link href={`/admin/blog/categorias?editar=${category.id}`}>
                        <Pencil size={15} aria-hidden="true" />
                        Editar
                      </Link>

                      <form action={deleteBlogCategory}>
                        <input name="id" type="hidden" value={category.id} />
                        <button type="submit" title="Excluir categoria">
                          <Trash2 size={15} aria-hidden="true" />
                          Excluir
                        </button>
                      </form>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState
              icon={FolderTree}
              title="Nenhuma categoria cadastrada"
              description="Crie a primeira categoria para organizá-la nos artigos do Blog."
            />
          )}
        </section>

        <aside className={pageStyles.formColumn}>
          {editingId && !editingCategory ? (
            <p className={styles.queryError}>A categoria selecionada não foi encontrada.</p>
          ) : (
            <BlogCategoryForm category={editingCategory} action={saveBlogCategory} />
          )}
        </aside>
      </div>
    </>
  );
}
