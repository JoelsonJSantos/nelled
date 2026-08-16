export type CampaignActionState = {
  status: "idle" | "success" | "error";
  message: string;
  campaignId?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialCampaignActionState: CampaignActionState = {
  status: "idle",
  message: "",
};
