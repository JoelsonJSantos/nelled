import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { saveProject } from "@/app/admin/portfolio/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin";
import { normalizeProjectRecord } from "@/lib/portfolio";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = { title: "Editar projeto", description: "Edição de projeto no painel da Nelled Studio." };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
};

export default async function EditProject({ params, searchParams }: Props) {
  const supabase = await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [{ data, error }, { data: media }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    supabase.from("media_library").select("id,public_id,url,alt_text,mime_type,bytes,created_at").order("created_at", { ascending: false }),
  ]);
  if (error || !data) notFound();
  const project = normalizeProjectRecord(data);

  return (
    <>
      <AdminPageHeader eyebrow="Portfólio" title="Editar projeto" description={`Atualize o case “${project.name}”.`} />
      <ProjectForm record={project} media={(media ?? []).map(normalizeMediaItem)} action={saveProject} initialMessage={query.created === "1" ? "Projeto criado como rascunho." : undefined} />
    </>
  );
}
