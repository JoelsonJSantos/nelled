import type { Metadata } from "next";
import { Construction } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Nova campanha", description: "Cadastro de campanha no painel da Nelled Studio." };

export default async function NewCampaign() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Nova campanha" description="Área preparada para o cadastro de campanhas da Nelled Studio." />
      <AdminEmptyState icon={Construction} title="Editor em preparação" description="O formulário de campanhas será conectado em uma próxima etapa." action={{ label: "Voltar para anúncios", href: "/admin/anuncios" }} />
    </>
  );
}
