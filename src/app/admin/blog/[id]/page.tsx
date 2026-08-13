import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { savePost } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Editar artigo", description: "Edição de artigo no painel da Nelled Studio." };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin();
  const { id } = await params;
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return <><AdminPageHeader eyebrow="Blog" title="Editar artigo" description={`Atualize o conteúdo “${data.title}”.`} /><CmsForm kind="post" record={data} action={savePost} /></>;
}
