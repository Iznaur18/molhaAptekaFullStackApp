export const CAMPAIGN_MODERATION_STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

type CampaignRecord = {
  createdAt?: string | Date | null;
  imageUrl?: string | null;
};

export const campaignModerationIsStale = (campaign: CampaignRecord, nowMs = Date.now()) => {
  const createdAt = campaign.createdAt ? new Date(String(campaign.createdAt)).getTime() : NaN;
  return Number.isFinite(createdAt) && nowMs - createdAt >= CAMPAIGN_MODERATION_STALE_THRESHOLD_MS;
};

export const campaignModerationNeedsAttention = (campaign: CampaignRecord, nowMs = Date.now()) => {
  if (campaignModerationIsStale(campaign, nowMs)) {
    return true;
  }
  if ("imageUrl" in campaign && !String(campaign.imageUrl ?? "").trim()) {
    return true;
  }
  return false;
};
