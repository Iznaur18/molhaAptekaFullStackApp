import { resolveIntroAdAdvertiserName } from "@/entities/intro-ad/lib/resolveIntroAdAdvertiserName";
import { campaignModerationIsStale, campaignModerationNeedsAttention } from "@/shared/lib/campaignModerationAttention";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";

export function resolveModerationCampaignCollapsedPreview(
  campaign: Record<string, unknown>,
  nowMs = Date.now(),
) {
  if (campaignModerationIsStale(campaign, nowMs)) {
    return INTRO_AD_MODERATION_PAGE_UI.COLLAPSED_STALE;
  }
  if ("imageUrl" in campaign && !String(campaign.imageUrl ?? "").trim()) {
    return INTRO_AD_MODERATION_PAGE_UI.COLLAPSED_MISSING_MEDIA;
  }
  return null;
}

export function resolveModerationCampaignTitle(campaign: Record<string, unknown>) {
  return resolveIntroAdAdvertiserName(campaign);
}
