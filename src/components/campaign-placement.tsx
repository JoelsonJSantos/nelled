import { CampaignCreative } from "@/components/campaign-creative";
import { type CampaignPlacement as CampaignPlacementValue } from "@/lib/campaigns";
import { getCampaignClockSlot } from "@/lib/campaign-clock";
import { getActiveCampaignsForPlacement, type PublicCampaign } from "@/lib/public-campaigns";
import { getSiteSettings } from "@/lib/site-settings";

export async function CampaignPlacement({
  placement,
  campaigns: suppliedCampaigns,
}: {
  placement: CampaignPlacementValue;
  campaigns?: PublicCampaign[];
}) {
  const [campaigns, settings] = await Promise.all([
    suppliedCampaigns ? Promise.resolve(suppliedCampaigns) : getActiveCampaignsForPlacement(placement),
    getSiteSettings(),
  ]);

  if (!campaigns.length) return null;

  return (
    <CampaignCreative
      campaigns={campaigns}
      placement={placement}
      consentVersion={settings.pages.privacyBanner.version}
      siteOrigin={settings.domain}
      initialClockSlot={getCampaignClockSlot()}
    />
  );
}
