import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveProject } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CmsForm } from "@/components/cms-form";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Editar projeto", description: "Edição de projeto no painel da Nelled Studio." };

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin();
  const { id } = await params;
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  return <><AdminPageHeader eyebrow="Portfólio" title="Editar projeto" description={`Atualize o case “${data.name}”.`} /><CmsForm kind="project" record={data} action={saveProject} /></>;
}
