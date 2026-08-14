import type { Metadata } from "next";

import { savePost } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = {
  title: "Novo artigo",
  description:
    "Cadastro de artigo no painel da Nelled Studio.",
};

export default async function NewPost() {
  const supabase = await requireAdmin();

  const [categoriesResult, mediaResult] =
    await Promise.all([
      supabase
        .from("blog_categories")
        .select("id,name")
        .order("name", {
          ascending: true,
        }),

      supabase
        .from("media_library")
        .select(
          `
            id,
            public_id,
            url,
            alt_text,
            mime_type,
            bytes,
            created_at
          `,
        )
        .order("created_at", {
          ascending: false,
        }),
    ]);

  if (categoriesResult.error) {
    throw new Error(
      "Não foi possível carregar as categorias do blog.",
    );
  }

  if (mediaResult.error) {
    throw new Error(
      "Não foi possível carregar a biblioteca de mídia.",
    );
  }

  const categories =
    categoriesResult.data ?? [];

  const media = (
    mediaResult.data ?? []
  ).map(normalizeMediaItem);

  return (
    <>
      <AdminPageHeader
        eyebrow="Blog"
        title="Novo artigo"
        description="Escreva e prepare um novo conteúdo para publicação."
      />

      <BlogForm
        categories={categories}
        initialMedia={media}
        action={savePost}
      />
    </>
  );
}