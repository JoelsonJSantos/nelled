import type { Metadata } from "next";
import { saveProject } from "@/app/admin/portfolio/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = { title: "Novo projeto", description: "Cadastro de projeto no painel da Nelled Studio." };

export default async function NewProject() {
  const supabase = await requireAdmin();
  const { data: media } = await supabase.from("media_library").select("id,public_id,url,alt_text,mime_type,bytes,created_at").order("created_at", { ascending: false });
  return (
    <>
      <AdminPageHeader eyebrow="Portfólio" title="Novo projeto" description="Cadastre as informações que serão usadas no case público." />
      <ProjectForm action={saveProject} media={(media ?? []).map(normalizeMediaItem)} />
    </>
  );
}
