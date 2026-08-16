"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin";
import { campaignCreativeFormats, campaignPlacementSchema, isCampaignPlacement, requiredCampaignCreativeFormats } from "@/lib/campaigns";
import type { CampaignActionState } from "@/lib/campaign-action-state";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .url("Informe uma URL válida.")
  .max(1_000)
  .optional()
  .or(z.literal(""));

const campaignSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da campanha.").max(140),
  title: z.string().trim().min(2, "Informe o título do anúncio.").max(180),
  description: optionalText(1_200),
  horizontalCreativeUrl: optionalUrl,
  verticalCreativeUrl: optionalUrl,
  ctaLabel: optionalText(80),
  targetUrl: z.string().trim().url("Informe a URL de destino.").max(1_000),
  placements: z.array(campaignPlacementSchema).min(1, "Selecione pelo menos um placement."),
  partnerId: z.string().uuid().optional().or(z.literal("")),
  active: z.boolean(),
  priority: z.coerce.number().int().min(0, "A prioridade não pode ser negativa.").max(10_000),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
});

const quickCampaignActionSchema = z.object({
  id: z.string().uuid(),
  operation: z.enum(["activate", "deactivate", "delete"]),
});

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function placementValues(formData: FormData) {
  return formData
    .getAll("placements")
    .map((value) => String(value));
}

function parseDate(value: string, field: "startsAt" | "endsAt") {
  if (!value) return { value: null };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: { [field]: ["Informe uma data e hora válidas."] } };
  }

  return { value: date.toISOString() };
}

function revalidateCampaigns(id?: string) {
  revalidatePath("/admin/anuncios");
  if (id) revalidatePath(`/admin/anuncios/${id}`);
}

function creativeValues(input: z.infer<typeof campaignSchema>) {
  return campaignCreativeFormats.flatMap((format) => {
    const imageUrl = format === "horizontal" ? input.horizontalCreativeUrl : input.verticalCreativeUrl;
    return imageUrl ? [{ format, imageUrl }] : [];
  });
}

function missingCreativeFormats(placements: ReturnType<typeof placementValues>, creatives: { format: string }[]) {
  return requiredCampaignCreativeFormats(placements.filter(isCampaignPlacement))
    .filter((format) => !creatives.some((creative) => creative.format === format));
}

export async function saveCampaign(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const parsed = campaignSchema.safeParse({
    name: read(formData, "name"),
    title: read(formData, "title"),
    description: read(formData, "description"),
    horizontalCreativeUrl: read(formData, "horizontalCreativeUrl"),
    verticalCreativeUrl: read(formData, "verticalCreativeUrl"),
    ctaLabel: read(formData, "ctaLabel"),
    targetUrl: read(formData, "targetUrl"),
    placements: placementValues(formData),
    partnerId: read(formData, "partnerId"),
    active: formData.get("active") === "on",
    priority: read(formData, "priority") || "0",
    startsAt: read(formData, "startsAt"),
    endsAt: read(formData, "endsAt"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados antes de salvar.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const creatives = creativeValues(parsed.data);
  const missingFormats = missingCreativeFormats(parsed.data.placements, creatives);
  if (parsed.data.active && missingFormats.length) {
    return {
      status: "error",
      message: `Adicione o criativo ${missingFormats.map((format) => format === "horizontal" ? "horizontal" : "vertical").join(" e ")} para ativar esta campanha.`,
      fieldErrors: Object.fromEntries(missingFormats.map((format) => [`${format}CreativeUrl`, [`O criativo ${format} é obrigatório para os placements selecionados.`]])),
    };
  }

  const startsAt = parseDate(parsed.data.startsAt ?? "", "startsAt");
  const endsAt = parseDate(parsed.data.endsAt ?? "", "endsAt");

  if ("error" in startsAt || "error" in endsAt) {
    return {
      status: "error",
      message: "Revise o período de veiculação.",
      fieldErrors: {
        ...(startsAt.error ?? {}),
        ...(endsAt.error ?? {}),
      },
    };
  }

  if (startsAt.value && endsAt.value && new Date(endsAt.value) < new Date(startsAt.value)) {
    return {
      status: "error",
      message: "A data final não pode ser anterior à data inicial.",
      fieldErrors: { endsAt: ["Escolha uma data posterior à inicial."] },
    };
  }

  const supabase = await requireAdmin();
  const id = read(formData, "id");
  const payload = {
    partner_id: parsed.data.partnerId || null,
    name: parsed.data.name,
    title: parsed.data.title,
    description: parsed.data.description || null,
    cta_label: parsed.data.ctaLabel || null,
    target_url: parsed.data.targetUrl,
    placements: parsed.data.placements,
    active: false,
    priority: parsed.data.priority,
    starts_at: startsAt.value,
    ends_at: endsAt.value,
  };

  const result = id
    ? await supabase.from("ad_campaigns").update(payload).eq("id", id).select("id").maybeSingle()
    : await supabase.from("ad_campaigns").insert(payload).select("id").single();

  if (result.error) {
    return { status: "error", message: "Não foi possível salvar a campanha." };
  }

  if (!result.data) {
    return { status: "error", message: "A campanha não foi encontrada ou não pôde ser atualizada." };
  }

  const campaignId = result.data.id;

  const mediaUrls = creatives.map((creative) => creative.imageUrl);
  const { data: media, error: mediaError } = mediaUrls.length
    ? await supabase.from("media_library").select("url,public_id").in("url", mediaUrls)
    : { data: [], error: null };

  if (mediaError) return { status: "error", message: "Não foi possível preparar os criativos da campanha." };

  const publicIds = new Map((media ?? []).map((item) => [item.url, item.public_id]));
  const missingFormatsToDelete = campaignCreativeFormats.filter((format) => !creatives.some((creative) => creative.format === format));

  if (missingFormatsToDelete.length) {
    const { error: deletionError } = await supabase
      .from("ad_campaign_creatives")
      .delete()
      .eq("campaign_id", campaignId)
      .in("format", missingFormatsToDelete);
    if (deletionError) return { status: "error", message: "Não foi possível atualizar os criativos da campanha." };
  }

  if (creatives.length) {
    const { error: creativeError } = await supabase
      .from("ad_campaign_creatives")
      .upsert(
        creatives.map((creative) => ({
          campaign_id: campaignId,
          format: creative.format,
          image_url: creative.imageUrl,
          image_public_id: publicIds.get(creative.imageUrl) ?? null,
        })),
        { onConflict: "campaign_id,format" },
      );
    if (creativeError) return { status: "error", message: "Não foi possível salvar os criativos da campanha." };
  }

  const { error: activationError } = await supabase
    .from("ad_campaigns")
    .update({ active: parsed.data.active })
    .eq("id", campaignId);

  if (activationError) return { status: "error", message: "Os criativos foram salvos, mas não foi possível atualizar o status da campanha." };

  revalidateCampaigns(campaignId);
  return {
    status: "success",
    message: parsed.data.active ? "Campanha salva e ativa." : "Campanha salva como inativa.",
    campaignId,
  };
}

export async function quickCampaignAction(
  _previousState: CampaignActionState,
  formData: FormData,
): Promise<CampaignActionState> {
  const parsed = quickCampaignActionSchema.safeParse({
    id: read(formData, "id"),
    operation: read(formData, "operation"),
  });

  if (!parsed.success) return { status: "error", message: "Operação inválida." };

  const supabase = await requireAdmin();
  const { data: campaign, error } = await supabase
    .from("ad_campaigns")
    .select("id,placements,ad_campaign_creatives(format)")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (error) return { status: "error", message: "Não foi possível carregar a campanha." };
  if (!campaign) return { status: "error", message: "Campanha não encontrada." };

  if (parsed.data.operation === "delete") {
    const deletion = await supabase
      .from("ad_campaigns")
      .delete()
      .eq("id", campaign.id)
      .select("id")
      .maybeSingle();

    if (deletion.error || !deletion.data) {
      return { status: "error", message: "Não foi possível excluir a campanha." };
    }

    revalidateCampaigns(campaign.id);
    return { status: "success", message: "Campanha excluída." };
  }

  const active = parsed.data.operation === "activate";
  if (active) {
    const placements = Array.isArray(campaign.placements) ? campaign.placements.filter(isCampaignPlacement) : [];
    const creatives = Array.isArray(campaign.ad_campaign_creatives) ? campaign.ad_campaign_creatives : [];
    const missingFormats = requiredCampaignCreativeFormats(placements)
      .filter((format) => !creatives.some((creative) => creative.format === format));
    if (missingFormats.length) {
      return { status: "error", message: `Adicione o criativo ${missingFormats.join(" e ")} antes de ativar a campanha.` };
    }
  }
  const update = await supabase.from("ad_campaigns").update({ active }).eq("id", campaign.id);

  if (update.error) {
    return { status: "error", message: "Não foi possível atualizar o status da campanha." };
  }

  revalidateCampaigns(campaign.id);
  return {
    status: "success",
    message: active ? "Campanha ativada." : "Campanha desativada.",
  };
}
