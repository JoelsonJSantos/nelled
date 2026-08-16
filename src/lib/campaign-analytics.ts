import "server-only";

import type { getAdminClient } from "@/lib/admin";
import { campaignPlacementValues, type CampaignPlacement } from "@/lib/campaigns";

export const campaignAnalyticsPeriods = ["7d", "30d", "all"] as const;

export type CampaignAnalyticsPeriod = (typeof campaignAnalyticsPeriods)[number];

export type CampaignMetrics = {
  campaignId: string;
  impressions: number;
  clicks: number;
};

export type PlacementMetrics = {
  placement: CampaignPlacement;
  impressions: number;
  clicks: number;
};

export type DailyCampaignMetrics = {
  day: string;
  impressions: number;
  clicks: number;
};

type AdminClient = NonNullable<Awaited<ReturnType<typeof getAdminClient>>>;

function property(input: unknown, key: string) {
  return input && typeof input === "object" ? Reflect.get(input, key) : undefined;
}

function integer(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
}

function string(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function getCampaignAnalyticsPeriod(value: unknown): CampaignAnalyticsPeriod {
  return typeof value === "string" && campaignAnalyticsPeriods.includes(value as CampaignAnalyticsPeriod)
    ? value as CampaignAnalyticsPeriod
    : "30d";
}

export function campaignAnalyticsSince(period: CampaignAnalyticsPeriod) {
  if (period === "all") return null;

  const days = period === "7d" ? 7 : 30;
  const date = new Date();
  date.setDate(date.getDate() - (days - 1));
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function campaignCtr(impressions: number, clicks: number) {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}

export function formatCampaignNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatCampaignCtr(impressions: number, clicks: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(campaignCtr(impressions, clicks) / 100);
}

export async function getCampaignMetrics(
  supabase: AdminClient,
  period: CampaignAnalyticsPeriod,
  campaignId?: string,
) {
  const { data, error } = await supabase.rpc("get_ad_campaign_metrics", {
    p_since: campaignAnalyticsSince(period),
    p_campaign_id: campaignId ?? null,
  });

  const rows: unknown[] = Array.isArray(data) ? data : [];
  const metrics = rows.map((row): CampaignMetrics => ({
    campaignId: string(property(row, "campaign_id")),
    impressions: integer(property(row, "impressions")),
    clicks: integer(property(row, "clicks")),
  })).filter((item) => Boolean(item.campaignId));

  return { metrics, error };
}

export async function getPlacementMetrics(
  supabase: AdminClient,
  period: CampaignAnalyticsPeriod,
) {
  const { data, error } = await supabase.rpc("get_ad_placement_metrics", {
    p_since: campaignAnalyticsSince(period),
  });

  const rows: unknown[] = Array.isArray(data) ? data : [];
  const metrics = rows.map((row): PlacementMetrics | null => {
    const placement = string(property(row, "placement"));
    if (!campaignPlacementValues.includes(placement as CampaignPlacement)) return null;

    return {
      placement: placement as CampaignPlacement,
      impressions: integer(property(row, "impressions")),
      clicks: integer(property(row, "clicks")),
    };
  }).filter((item): item is PlacementMetrics => item !== null);

  return { metrics, error };
}

export async function getDailyCampaignMetrics(
  supabase: AdminClient,
  period: CampaignAnalyticsPeriod,
  campaignId: string,
) {
  const { data, error } = await supabase.rpc("get_ad_campaign_daily_metrics", {
    p_campaign_id: campaignId,
    p_since: campaignAnalyticsSince(period),
  });

  const rows: unknown[] = Array.isArray(data) ? data : [];
  const metrics = rows.map((row): DailyCampaignMetrics | null => {
    const day = string(property(row, "event_day"));
    return day ? {
      day,
      impressions: integer(property(row, "impressions")),
      clicks: integer(property(row, "clicks")),
    } : null;
  }).filter((item): item is DailyCampaignMetrics => item !== null);

  return { metrics, error };
}
