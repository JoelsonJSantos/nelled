import "server-only";

import { CAMPAIGN_ROTATION_INTERVAL_MS } from "@/lib/campaigns";

/** Slot absoluto usado para manter todos os banners sincronizados no tempo. */
export function getCampaignClockSlot() {
  return Math.floor(Date.now() / CAMPAIGN_ROTATION_INTERVAL_MS);
}
