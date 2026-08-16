import type { Metadata } from "next";
import { saveCampaign } from "@/app/admin/anuncios/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CampaignForm } from "@/components/admin/campaign-form";
import { requireAdmin } from "@/lib/admin";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = { title: "Nova campanha", description: "Cadastro de campanha no painel da Nelled Studio." };

export default async function NewCampaign() {
  const supabase = await requireAdmin();
  const [{ data: partners }, { data: media }] = await Promise.all([
    supabase.from("partners").select("id,name").order("name"),
    supabase.from("media_library").select("id,public_id,url,alt_text,mime_type,bytes,created_at").order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Nova campanha" description="Defina mensagem, placements, período e prioridade da campanha." />
      <CampaignForm action={saveCampaign} partners={partners ?? []} media={(media ?? []).map(normalizeMediaItem)} />
    </>
  );
}
