import Link from "next/link";
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  campaignAnalyticsPeriods,
  formatCampaignCtr,
  formatCampaignNumber,
  type CampaignAnalyticsPeriod,
  type CampaignMetrics,
  type DailyCampaignMetrics,
  type PlacementMetrics,
} from "@/lib/campaign-analytics";
import { campaignPlacements } from "@/lib/campaigns";

import adminStyles from "./admin-ui.module.css";
import styles from "./campaign-analytics.module.css";

const periodLabels: Record<CampaignAnalyticsPeriod, string> = {
  "7d": "7 dias",
  "30d": "30 dias",
  all: "Todo o período",
};

export function CampaignPeriodTabs({
  basePath,
  period,
  created,
}: {
  basePath: string;
  period: CampaignAnalyticsPeriod;
  created?: boolean;
}) {
  return (
    <nav className={styles.periodTabs} aria-label="Período das métricas">
      {campaignAnalyticsPeriods.map((value) => {
        const params = new URLSearchParams({ period: value });
        if (created) params.set("created", "1");

        return (
          <Link
            className={value === period ? styles.periodActive : ""}
            href={`${basePath}?${params.toString()}`}
            key={value}
          >
            {periodLabels[value]}
          </Link>
        );
      })}
    </nav>
  );
}

export function CampaignSummaryCards({
  activeCampaigns,
  impressions,
  clicks,
}: {
  activeCampaigns: number;
  impressions: number;
  clicks: number;
}) {
  return (
    <div className={adminStyles.statGrid}>
      <MetricCard icon={BarChart3} label="Campanhas ativas" value={formatCampaignNumber(activeCampaigns)} />
      <MetricCard icon={Eye} label="Impressões" value={formatCampaignNumber(impressions)} />
      <MetricCard icon={MousePointerClick} label="Cliques" value={formatCampaignNumber(clicks)} />
      <MetricCard icon={TrendingUp} label="CTR global" value={formatCampaignCtr(impressions, clicks)} />
    </div>
  );
}

export function CampaignPerformance({
  metrics,
  daily,
  period,
  basePath,
  created,
  hasError,
}: {
  metrics: CampaignMetrics;
  daily: DailyCampaignMetrics[];
  period: CampaignAnalyticsPeriod;
  basePath: string;
  created?: boolean;
  hasError: boolean;
}) {
  return (
    <section className={styles.performance} aria-labelledby="campaign-performance-title">
      <div className={styles.performanceHeader}>
        <div>
          <p className={adminStyles.eyebrow}>Desempenho</p>
          <h2 id="campaign-performance-title">Métricas da campanha</h2>
          <p>Eventos registrados no período selecionado.</p>
        </div>
        <CampaignPeriodTabs basePath={basePath} period={period} created={created} />
      </div>

      {hasError ? (
        <p className={adminStyles.queryError}>Não foi possível carregar as métricas desta campanha.</p>
      ) : (
        <>
          <div className={styles.metricGrid}>
            <MetricCard icon={Eye} label="Impressões" value={formatCampaignNumber(metrics.impressions)} />
            <MetricCard icon={MousePointerClick} label="Cliques" value={formatCampaignNumber(metrics.clicks)} />
            <MetricCard icon={TrendingUp} label="CTR" value={formatCampaignCtr(metrics.impressions, metrics.clicks)} />
          </div>
          <DailyPerformance daily={daily} />
        </>
      )}
    </section>
  );
}

export function CampaignRanking({
  campaigns,
}: {
  campaigns: Array<{ id: string; name: string; metrics: CampaignMetrics }>;
}) {
  return (
    <section className={adminStyles.panel}>
      <div className={adminStyles.panelHeader}>
        <div><h2>Campanhas com melhor desempenho</h2><p className={styles.panelHint}>CTR com mínimo de 20 impressões.</p></div>
      </div>
      {campaigns.length ? (
        <div className={adminStyles.compactList}>
          {campaigns.map(({ id, name, metrics }) => (
            <Link className={adminStyles.compactRow} href={`/admin/anuncios/${id}`} key={id}>
              <span className={adminStyles.rowMain}><strong>{name}</strong><span>{formatCampaignNumber(metrics.impressions)} impressões · {formatCampaignNumber(metrics.clicks)} cliques</span></span>
              <strong className={styles.ctr}>{formatCampaignCtr(metrics.impressions, metrics.clicks)}</strong>
            </Link>
          ))}
        </div>
      ) : <AnalyticsEmpty message="Ainda não há campanhas com o volume mínimo para o ranking." />}
    </section>
  );
}

export function PlacementPerformance({ metrics }: { metrics: PlacementMetrics[] }) {
  const byPlacement = new Map(metrics.map((metric) => [metric.placement, metric]));

  return (
    <section className={adminStyles.panel}>
      <div className={adminStyles.panelHeader}><div><h2>Desempenho por placement</h2><p className={styles.panelHint}>Distribuição dos eventos no período.</p></div></div>
      <div className={styles.placementList}>
        {campaignPlacements.map((placement) => {
          const item = byPlacement.get(placement.value) ?? { impressions: 0, clicks: 0 };
          return <div className={styles.placementRow} key={placement.value}><span><strong>{placement.label}</strong><small>{placement.description}</small></span><span>{formatCampaignNumber(item.impressions)}<small>impressões</small></span><span>{formatCampaignNumber(item.clicks)}<small>cliques</small></span><strong>{formatCampaignCtr(item.impressions, item.clicks)}</strong></div>;
        })}
      </div>
    </section>
  );
}

function DailyPerformance({ daily }: { daily: DailyCampaignMetrics[] }) {
  if (!daily.length) return <AnalyticsEmpty message="Nenhum evento foi registrado neste período." />;

  const maxValue = Math.max(...daily.flatMap((item) => [item.impressions, item.clicks]), 1);
  return (
    <div className={styles.daily}>
      <div className={styles.dailyHeading}><h3>Evolução diária</h3><p>Impressões e cliques por dia.</p></div>
      <div className={styles.chart} role="img" aria-label="Gráfico diário de impressões e cliques">
        {daily.map((item) => <div className={styles.chartItem} key={item.day}><div className={styles.bars}><span title={`${formatCampaignNumber(item.impressions)} impressões`} style={{ height: `${Math.max(4, (item.impressions / maxValue) * 100)}%` }} /><span title={`${formatCampaignNumber(item.clicks)} cliques`} style={{ height: `${Math.max(4, (item.clicks / maxValue) * 100)}%` }} /></div><small>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${item.day}T12:00:00`))}</small></div>)}
      </div>
      <p className={styles.legend}><i /> Impressões <i /> Cliques</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className={adminStyles.statCard}><span className={adminStyles.statIcon}><Icon size={18} /></span><strong className={adminStyles.statValue}>{value}</strong><p className={adminStyles.statLabel}>{label}</p></div>;
}

function AnalyticsEmpty({ message }: { message: string }) {
  return <div className={styles.empty}><BarChart3 size={18} /><p>{message}</p></div>;
}
