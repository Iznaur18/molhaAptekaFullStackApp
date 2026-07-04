import { campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";

type PendingCampaign = {
  createdAt?: string | Date | null;
  imageUrl?: string | null;
};

export const filterPendingModerationCampaigns = <T extends PendingCampaign>(
  campaigns: T[],
  { attentionOnly = false, nowMs = Date.now() } = {},
) => {
  if (!attentionOnly) {
    return campaigns;
  }
  return campaigns.filter((campaign) => campaignModerationNeedsAttention(campaign, nowMs));
};
