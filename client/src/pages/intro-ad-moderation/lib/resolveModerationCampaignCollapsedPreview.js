import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { campaignModerationIsStale } from "../../../shared/lib/campaignModerationAttention.js";

/**
 * @param {Record<string, unknown>} campaign
 * @param {number} [nowMs]
 */
export function resolveModerationCampaignCollapsedPreview(campaign, nowMs = Date.now()) {
  if (campaignModerationIsStale(campaign, nowMs)) {
    return INTRO_AD_MODERATION_PAGE_UI.COLLAPSED_STALE;
  }
  if ("imageUrl" in campaign && !String(campaign.imageUrl ?? "").trim()) {
    return INTRO_AD_MODERATION_PAGE_UI.COLLAPSED_MISSING_MEDIA;
  }
  return null;
}
