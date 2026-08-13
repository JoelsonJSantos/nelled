import type { Metadata } from "next";
import { saveProject } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Novo projeto", description: "Cadastro de projeto no painel da Nelled Studio." };

export default async function NewProject() {
  await requireAdmin();
  return <><AdminPageHeader eyebrow="Portfólio" title="Novo projeto" description="Cadastre as informações que serão usadas no case público." /><CmsForm kind="project" action={saveProject} /></>;
}
