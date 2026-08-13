import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { savePartner } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Editar parceiro", description: "Edição de parceiro no painel da Nelled Studio." };

export default async function EditPartner({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin();
  const { id } = await params;
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return <><AdminPageHeader eyebrow="Parceiros" title="Editar parceiro" description={`Atualize o cadastro de “${data.name}”.`} /><CmsForm kind="partner" record={data} action={savePartner} /></>;
}
