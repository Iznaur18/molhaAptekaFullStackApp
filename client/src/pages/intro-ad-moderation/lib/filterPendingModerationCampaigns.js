import { campaignModerationNeedsAttention } from "../../../shared/lib/campaignModerationAttention.js";

/**
 * @template T
 * @param {T[]} campaigns
 * @param {{ attentionOnly?: boolean; nowMs?: number }} [options]
 */
export function filterPendingModerationCampaigns(
  campaigns,
  { attentionOnly = false, nowMs = Date.now() } = {},
) {
  if (!attentionOnly) {
    return campaigns;
  }
  return campaigns.filter((campaign) => campaignModerationNeedsAttention(campaign, nowMs));
}
