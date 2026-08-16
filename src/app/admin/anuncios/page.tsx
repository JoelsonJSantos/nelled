import type { Metadata } from "next";
import { Megaphone, Plus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import {
  CampaignPeriodTabs,
  CampaignRanking,
  CampaignSummaryCards,
  PlacementPerformance,
} from "@/components/admin/campaign-analytics";
import { CampaignRowActions } from "@/components/admin/campaign-row-actions";
import styles from "@/components/admin/admin-ui.module.css";
import { formatAdminDate } from "@/lib/admin-format";
import { requireAdmin } from "@/lib/admin";
import {
  campaignCtr,
  getCampaignAnalyticsPeriod,
  getCampaignMetrics,
  getPlacementMetrics,
  formatCampaignCtr,
  formatCampaignNumber,
} from "@/lib/campaign-analytics";
import { campaignPlacements, campaignStatus, normalizeCampaignRecord } from "@/lib/campaigns";

import pageStyles from "./page.module.css";

export const metadata: Metadata = {
  title: "Anúncios",
  description: "Gerenciamento de campanhas e anúncios da Nelled Studio.",
};

type SearchParams = Promise<{ period?: string | string[] }>;

export default async function AdsAdmin({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await requireAdmin();
  const params = await searchParams;
  const period = getCampaignAnalyticsPeriod(params.period);
  const [campaignsResult, campaignMetricsResult, placementMetricsResult] = await Promise.all([
    supabase
      .from("ad_campaigns")
      .select("id,name,title,target_url,active,placements,starts_at,ends_at,priority,created_at")
      .order("created_at", { ascending: false }),
    getCampaignMetrics(supabase, period),
    getPlacementMetrics(supabase, period),
  ]);
  const { data, error } = campaignsResult;
  const campaigns = (data ?? []).map(normalizeCampaignRecord);
  const placementLabel = (value: string) => campaignPlacements.find((placement) => placement.value === value)?.label ?? value;
  const metricsByCampaign = new Map(campaignMetricsResult.metrics.map((metrics) => [metrics.campaignId, metrics]));
  const totalImpressions = campaignMetricsResult.metrics.reduce((total, metrics) => total + metrics.impressions, 0);
  const totalClicks = campaignMetricsResult.metrics.reduce((total, metrics) => total + metrics.clicks, 0);
  const activeCampaigns = campaigns.filter((campaign) => campaignStatus(campaign) === "active").length;
  const ranking = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    metrics: metricsByCampaign.get(campaign.id) ?? { campaignId: campaign.id, impressions: 0, clicks: 0 },
  })).filter(({ metrics }) => metrics.impressions >= 20).sort((first, second) => campaignCtr(second.metrics.impressions, second.metrics.clicks) - campaignCtr(first.metrics.impressions, first.metrics.clicks) || second.metrics.clicks - first.metrics.clicks).slice(0, 5);
  const hasMetricsError = Boolean(campaignMetricsResult.error || placementMetricsResult.error);

  return (
    <>
      <AdminPageHeader eyebrow="Comercial" title="Anúncios" description="Organize campanhas, posicionamentos e períodos de exibição." action={{ label: "Nova campanha", href: "/admin/anuncios/novo", icon: Plus }} />
      <CampaignPeriodTabs basePath="/admin/anuncios" period={period} />
      <div style={{ marginTop: 18 }}><CampaignSummaryCards activeCampaigns={activeCampaigns} impressions={totalImpressions} clicks={totalClicks} /></div>
      {hasMetricsError && <p className={styles.queryError}>Parte das métricas não pôde ser carregada. A listagem de campanhas continua disponível.</p>}
      {error && <p className={styles.queryError}>Não foi possível carregar as campanhas. Tente novamente.</p>}
      {!error && campaigns.length ? (
        <>
        <div className={`${styles.panel} ${pageStyles.campaignList}`}>
          {campaigns.map((campaign) => {
            const metrics = metricsByCampaign.get(campaign.id) ?? {
              campaignId: campaign.id,
              impressions: 0,
              clicks: 0,
            };
            const periodLabel = campaign.startsAt
              ? `${formatAdminDate(campaign.startsAt)} → ${campaign.endsAt ? formatAdminDate(campaign.endsAt) : "contínua"}`
              : campaign.endsAt
                ? `Até ${formatAdminDate(campaign.endsAt)}`
                : "Sem período";

            return (
              <article className={pageStyles.campaignCard} key={campaign.id}>
                <div className={pageStyles.campaignInfo}>
                  <div className={pageStyles.campaignHeading}>
                    <div>
                      <h2>{campaign.name}</h2>
                      <p>{campaign.title}</p>
                    </div>
                    <AdminStatusBadge status={campaignStatus(campaign)} />
                  </div>

                  <div className={pageStyles.placements}>
                    <span>Placements</span>
                    <p>{campaign.placements.map(placementLabel).join(" · ") || "Sem placement"}</p>
                  </div>
                </div>

                <div className={pageStyles.campaignActions}>
                  <CampaignRowActions id={campaign.id} targetUrl={campaign.targetUrl} active={campaign.active} />
                </div>

                <dl className={pageStyles.metrics}>
                  <div>
                    <dt>Impressões</dt>
                    <dd>{formatCampaignNumber(metrics.impressions)}</dd>
                  </div>
                  <div>
                    <dt>Cliques</dt>
                    <dd>{formatCampaignNumber(metrics.clicks)}</dd>
                  </div>
                  <div>
                    <dt>CTR</dt>
                    <dd className={pageStyles.ctr}>{formatCampaignCtr(metrics.impressions, metrics.clicks)}</dd>
                  </div>
                  <div className={pageStyles.period}>
                    <dt>Período</dt>
                    <dd>{periodLabel}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
        <div className={styles.sectionGrid}>
          <CampaignRanking campaigns={ranking} />
          <PlacementPerformance metrics={placementMetricsResult.metrics} />
        </div>
        </>
      ) : !error && <AdminEmptyState icon={Megaphone} title="Nenhuma campanha criada" description="As campanhas publicitárias aparecerão aqui quando forem cadastradas." action={{ label: "Criar campanha", href: "/admin/anuncios/novo" }} />}
    </>
  );
}
