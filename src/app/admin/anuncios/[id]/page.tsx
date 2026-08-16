import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { saveCampaign } from "@/app/admin/anuncios/actions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CampaignPerformance } from "@/components/admin/campaign-analytics";
import { CampaignForm } from "@/components/admin/campaign-form";
import { requireAdmin } from "@/lib/admin";
import { getCampaignAnalyticsPeriod, getCampaignMetrics, getDailyCampaignMetrics } from "@/lib/campaign-analytics";
import { normalizeCampaignRecord } from "@/lib/campaigns";
import { normalizeMediaItem } from "@/lib/media";

export const metadata: Metadata = {
  title: "Editar campanha",
  description: "Edição de campanha no painel da Nelled Studio.",
};

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string | string[]; period?: string | string[] }>;
};

export default async function EditCampaign({ params, searchParams }: Props) {
  const supabase = await requireAdmin();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const period = getCampaignAnalyticsPeriod(query.period);
  const [{ data, error }, { data: partners }, { data: media }, metricsResult, dailyResult] = await Promise.all([
    supabase.from("ad_campaigns").select("*,ad_campaign_creatives(id,format,image_url,image_public_id)").eq("id", id).maybeSingle(),
    supabase.from("partners").select("id,name").order("name"),
    supabase.from("media_library").select("id,public_id,url,alt_text,mime_type,bytes,created_at").order("created_at", { ascending: false }),
    getCampaignMetrics(supabase, period, id),
    getDailyCampaignMetrics(supabase, period, id),
  ]);

  if (error || !data) notFound();

  const campaign = normalizeCampaignRecord(data);
  const metrics = metricsResult.metrics[0] ?? { campaignId: campaign.id, impressions: 0, clicks: 0 };

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Editar campanha" description={`Atualize “${campaign.name}”, seus placements e período de veiculação.`} />
      <CampaignPerformance metrics={metrics} daily={dailyResult.metrics} period={period} basePath={`/admin/anuncios/${campaign.id}`} created={query.created === "1"} hasError={Boolean(metricsResult.error || dailyResult.error)} />
      <CampaignForm record={campaign} partners={partners ?? []} media={(media ?? []).map(normalizeMediaItem)} action={saveCampaign} initialMessage={query.created === "1" ? "Campanha criada com sucesso." : undefined} />
    </>
  );
}
