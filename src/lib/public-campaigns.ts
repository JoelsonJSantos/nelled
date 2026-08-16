import "server-only";

import { cache } from "react";

import {
  campaignCreativeFormats,
  campaignCreativeFormatsForPlacement,
  campaignPlacementSchema,
  type CampaignCreativeFormat,
  type CampaignPlacement,
} from "@/lib/campaigns";
import { isSupportedMediaUrl } from "@/lib/portfolio";
import { createClient } from "@/lib/supabase/server";

export type PublicCampaign = {
  id: string;
  title: string;
  targetUrl: string;
  creatives: Partial<Record<CampaignCreativeFormat, { imageUrl: string }>>;
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function publicTargetUrl(value: unknown) {
  const url = text(value);

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:"
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}

function normalizePublicCampaign(
  row: unknown,
  requiredFormats: CampaignCreativeFormat[],
): PublicCampaign | null {
  if (!row || typeof row !== "object") return null;

  const id = text(Reflect.get(row, "id"));
  const title = text(Reflect.get(row, "title"));
  const targetUrl = publicTargetUrl(Reflect.get(row, "target_url"));

  const creativeRows = Reflect.get(row, "ad_campaign_creatives");
  const creatives = Array.isArray(creativeRows)
    ? creativeRows.reduce<PublicCampaign["creatives"]>((current, creative) => {
        if (!creative || typeof creative !== "object") return current;
        const format = text(Reflect.get(creative, "format"));
        const imageUrl = text(Reflect.get(creative, "image_url"));
        if (
          !campaignCreativeFormats.includes(format as CampaignCreativeFormat) ||
          !imageUrl ||
          !isSupportedMediaUrl(imageUrl)
        ) {
          return current;
        }

        current[format as CampaignCreativeFormat] = { imageUrl };
        return current;
      }, {})
    : {};

  if (!id || requiredFormats.some((format) => !creatives[format])) return null;

  return {
    id,
    title: title || "Banner da Nelled Studio",
    targetUrl,
    creatives,
  };
}

/**
 * Retorna todas as campanhas elegíveis em ordem determinística. Prioridade
 * apenas define a ordem da rotação — nunca exclui banners elegíveis.
 */
export const getActiveCampaignsForPlacement = cache(
  async (placement: CampaignPlacement): Promise<PublicCampaign[]> => {
    const parsedPlacement = campaignPlacementSchema.safeParse(placement);
    if (!parsedPlacement.success) return [];

    try {
      const supabase = await createClient();
      if (!supabase) return [];

      const now = new Date().toISOString();
      const requiredFormats = campaignCreativeFormatsForPlacement(parsedPlacement.data);
      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("id,title,target_url,ad_campaign_creatives!inner(format,image_url)")
        .eq("active", true)
        .contains("placements", [parsedPlacement.data])
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .in("ad_campaign_creatives.format", requiredFormats)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        console.error("Não foi possível selecionar uma campanha pública.", error.code);
        return [];
      }

      return (data ?? []).flatMap((row) => {
        const campaign = normalizePublicCampaign(row, requiredFormats);
        return campaign ? [campaign] : [];
      });
    } catch {
      return [];
    }
  },
);
