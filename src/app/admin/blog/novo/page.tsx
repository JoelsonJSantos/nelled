import type { Metadata } from "next";
import { savePost } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Novo artigo", description: "Cadastro de artigo no painel da Nelled Studio." };

export default async function NewPost() {
  await requireAdmin();
  return <><AdminPageHeader eyebrow="Blog" title="Novo artigo" description="Escreva e prepare um novo conteúdo para publicação." /><CmsForm kind="post" action={savePost} /></>;
}
