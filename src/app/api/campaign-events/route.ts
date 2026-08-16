import { z } from "zod";

import {
  campaignEventTypeSchema,
  campaignPlacementSchema,
} from "@/lib/campaigns";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const eventRequestSchema = z
  .object({
    campaignId: z.string().uuid(),
    eventType: campaignEventTypeSchema,
    placement: campaignPlacementSchema,
    pagePath: z
      .string()
      .min(1)
      .max(500)
      .startsWith("/")
      .refine((value) => !/[\r\n\0]/.test(value), "Caminho inválido."),
  })
  .strict();

const requestCounts = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 30;

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin === new URL(request.url).origin;
}

function isRateLimited(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const address = forwardedFor?.split(",")[0]?.trim();
  if (!address) return false;

  const now = Date.now();
  const current = requestCounts.get(address);

  if (!current || current.expiresAt <= now) {
    requestCounts.set(address, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_EVENTS;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ error: "Origem inválida." }, { status: 403 });
  }

  if (isRateLimited(request)) {
    return Response.json({ error: "Muitas solicitações." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const parsed = eventRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Evento inválido." }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return Response.json({ error: "Serviço indisponível." }, { status: 503 });
    }

    const { error } = await supabase.rpc("record_ad_event", {
      p_campaign_id: parsed.data.campaignId,
      p_event_type: parsed.data.eventType,
      p_placement: parsed.data.placement,
      p_page_path: parsed.data.pagePath,
    });

    if (error) {
      console.error("Não foi possível registrar o evento de campanha.", error.code);
      return Response.json({ error: "Não foi possível registrar o evento." }, { status: 500 });
    }
  } catch {
    return Response.json({ error: "Não foi possível registrar o evento." }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
