import type { Metadata } from "next";
import { savePartner } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Novo parceiro", description: "Cadastro de parceiro no painel da Nelled Studio." };

export default async function NewPartner() {
  await requireAdmin();
  return <><AdminPageHeader eyebrow="Parceiros" title="Novo parceiro" description="Cadastre uma empresa ou ferramenta no ecossistema Nelled." /><CmsForm kind="partner" action={savePartner} /></>;
}
