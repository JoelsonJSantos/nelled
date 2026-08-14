import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { savePost } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = {
  title: "Editar artigo",
  description:
    "Edição de artigo no painel da Nelled Studio.",
};

export default async function EditPost({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const supabase = await requireAdmin();

  const { id } = await params;

  const [
    postResult,
    categoriesResult,
    mediaResult,
  ] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .maybeSingle(),

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

  if (
    postResult.error ||
    !postResult.data
  ) {
    notFound();
  }

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
        title="Editar artigo"
        description={`Atualize o conteúdo “${postResult.data.title}”.`}
      />

      <BlogForm
        record={postResult.data}
        categories={categories}
        initialMedia={media}
        action={savePost}
      />
    </>
  );
}