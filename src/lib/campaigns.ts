import { z } from "zod";

export const campaignCreativeFormats = ["horizontal", "vertical"] as const;

export const campaignCreativeFormatSchema = z.enum(campaignCreativeFormats);

export type CampaignCreativeFormat = z.infer<typeof campaignCreativeFormatSchema>;

export type CampaignPlacementVisualVariant =
  | "horizontal-large"
  | "horizontal-compact"
  | "sidebar-vertical"
  | "vertical";

export type CampaignPlacementViewport = "desktop" | "mobile";

export const campaignCreativeFormatDetails: Record<CampaignCreativeFormat, {
  label: string;
  aspectRatio: string;
  recommendedDimensions: string;
}> = {
  horizontal: {
    label: "Horizontal",
    aspectRatio: "aproximadamente 3:1",
    recommendedDimensions: "1600 × 500 px",
  },
  vertical: {
    label: "Vertical",
    aspectRatio: "3:5",
    recommendedDimensions: "600 × 1000 px",
  },
};

export const campaignPlacements = [
  {
    value: "home-showcase",
    label: "Home · Destaques",
    description: "Área de destaque na página inicial.",
    desktopFormat: "horizontal",
    mobileFormat: "horizontal",
    desktopVisualVariant: "horizontal-large",
    mobileVisualVariant: "horizontal-large",
  },
  {
    value: "portfolio-list",
    label: "Portfólio · Listagem",
    description: "Lateral no desktop e após os projetos no mobile.",
    desktopFormat: "vertical",
    mobileFormat: "horizontal",
    desktopVisualVariant: "sidebar-vertical",
    mobileVisualVariant: "horizontal-compact",
  },
  {
    value: "blog-list",
    label: "Blog · Listagem",
    description: "Lateral no desktop e após os artigos no mobile.",
    desktopFormat: "vertical",
    mobileFormat: "horizontal",
    desktopVisualVariant: "sidebar-vertical",
    mobileVisualVariant: "horizontal-compact",
  },
  {
    value: "blog-post-end",
    label: "Blog · Final do artigo",
    description: "Exibido ao final dos artigos publicados.",
    desktopFormat: "horizontal",
    mobileFormat: "horizontal",
    desktopVisualVariant: "horizontal-compact",
    mobileVisualVariant: "horizontal-compact",
  },
  {
    value: "partner-detail",
    label: "Parceiros · Detalhe",
    description: "No contexto da página de parceiro.",
    desktopFormat: "vertical",
    mobileFormat: "vertical",
    desktopVisualVariant: "vertical",
    mobileVisualVariant: "vertical",
  },
] as const satisfies readonly {
  value: string;
  label: string;
  description: string;
  desktopFormat: CampaignCreativeFormat;
  mobileFormat: CampaignCreativeFormat;
  desktopVisualVariant: CampaignPlacementVisualVariant;
  mobileVisualVariant: CampaignPlacementVisualVariant;
}[];

export const campaignPlacementValues = campaignPlacements.map(
  (placement) => placement.value,
) as [
  (typeof campaignPlacements)[number]["value"],
  ...(typeof campaignPlacements)[number]["value"][],
];

export const campaignPlacementSchema = z.enum(campaignPlacementValues);

export type CampaignPlacement = z.infer<typeof campaignPlacementSchema>;

function placementConfig(placement: CampaignPlacement) {
  const config = campaignPlacements.find((item) => item.value === placement);
  if (!config) throw new Error("Placement de campanha inválido.");
  return config;
}

export function campaignPlacementVisualVariant(
  placement: CampaignPlacement,
  viewport: CampaignPlacementViewport = "desktop",
) {
  const config = placementConfig(placement);
  return viewport === "mobile"
    ? config.mobileVisualVariant
    : config.desktopVisualVariant;
}

export function campaignPlacementFormatLabel(placement: CampaignPlacement) {
  const { desktopFormat, mobileFormat } = placementConfig(placement);
  if (desktopFormat === mobileFormat) {
    return campaignCreativeFormatDetails[desktopFormat].label;
  }

  return `Desktop: ${campaignCreativeFormatDetails[desktopFormat].label} · Mobile: ${campaignCreativeFormatDetails[mobileFormat].label}`;
}

export function campaignCreativeFormatForPlacement(placement: CampaignPlacement) {
  return placementConfig(placement).desktopFormat;
}

export function campaignCreativeFormatsForPlacement(placement: CampaignPlacement) {
  const { desktopFormat, mobileFormat } = placementConfig(placement);
  return desktopFormat === mobileFormat
    ? [desktopFormat]
    : [desktopFormat, mobileFormat];
}

export function placementsForCampaignCreativeFormat(format: CampaignCreativeFormat) {
  return campaignPlacements.filter((placement) =>
    campaignCreativeFormatsForPlacement(placement.value).includes(format),
  );
}

export function requiredCampaignCreativeFormats(placements: CampaignPlacement[]) {
  return [...new Set(placements.flatMap(campaignCreativeFormatsForPlacement))];
}

export const campaignEventTypes = ["impression", "click"] as const;

/** Duração de cada banner antes da próxima troca automática. */
export const CAMPAIGN_ROTATION_INTERVAL_MS = 6_000;

export const campaignEventTypeSchema = z.enum(campaignEventTypes);

export type CampaignEventType = z.infer<typeof campaignEventTypeSchema>;

export function isCampaignPlacement(value: string): value is CampaignPlacement {
  return campaignPlacementValues.includes(value as CampaignPlacement);
}

export type CampaignRecord = {
  id: string;
  partnerId: string;
  name: string;
  title: string;
  description: string;
  creatives: Partial<Record<CampaignCreativeFormat, CampaignCreative>>;
  ctaLabel: string;
  targetUrl: string;
  placements: CampaignPlacement[];
  active: boolean;
  priority: number;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export type CampaignCreative = {
  format: CampaignCreativeFormat;
  imageUrl: string;
  imagePublicId: string;
};

function property(input: unknown, key: string) {
  if (!input || typeof input !== "object") return undefined;
  return Reflect.get(input, key);
}

function stringProperty(input: unknown, key: string) {
  const value = property(input, key);
  return typeof value === "string" ? value : "";
}

export function normalizeCampaignRecord(row: unknown): CampaignRecord {
  const placements = property(row, "placements");
  const priority = property(row, "priority");
  const creativeRows = property(row, "ad_campaign_creatives");
  const creatives = Array.isArray(creativeRows)
    ? creativeRows.reduce<Partial<Record<CampaignCreativeFormat, CampaignCreative>>>((current, creative) => {
        const format = stringProperty(creative, "format");
        if (!campaignCreativeFormats.includes(format as CampaignCreativeFormat)) return current;
        const imageUrl = stringProperty(creative, "image_url");
        if (!imageUrl) return current;
        current[format as CampaignCreativeFormat] = {
          format: format as CampaignCreativeFormat,
          imageUrl,
          imagePublicId: stringProperty(creative, "image_public_id"),
        };
        return current;
      }, {})
    : {};

  return {
    id: stringProperty(row, "id"),
    partnerId: stringProperty(row, "partner_id"),
    name: stringProperty(row, "name"),
    title: stringProperty(row, "title"),
    description: stringProperty(row, "description"),
    creatives,
    ctaLabel: stringProperty(row, "cta_label"),
    targetUrl: stringProperty(row, "target_url"),
    placements: Array.isArray(placements)
      ? placements.filter((placement): placement is CampaignPlacement =>
          campaignPlacementValues.includes(
            placement as CampaignPlacement,
          ),
        )
      : [],
    active: property(row, "active") === true,
    priority: typeof priority === "number" ? priority : 0,
    startsAt: stringProperty(row, "starts_at"),
    endsAt: stringProperty(row, "ends_at"),
    createdAt: stringProperty(row, "created_at"),
  };
}

export function campaignStatus(record: Pick<CampaignRecord, "active" | "startsAt" | "endsAt">, now = new Date()) {
  if (!record.active) return "inactive";
  if (record.endsAt && new Date(record.endsAt) < now) return "ended";
  if (record.startsAt && new Date(record.startsAt) > now) return "scheduled";
  return "active";
}

export function formatDateTimeLocal(value: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
