import {
  ANALYTICS_AD_KIND_CLICK,
  ANALYTICS_AD_KIND_IMPRESSION,
  ANALYTICS_AD_SURFACE_INTRO,
  ANALYTICS_AD_SURFACE_SITE_HEADER,
} from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { reportClientIssue } from "../../../shared/lib/reportClientIssue.js";

/**
 * @param {{
 *   kind: 'impression' | 'click';
 *   surface: typeof ANALYTICS_AD_SURFACE_INTRO | typeof ANALYTICS_AD_SURFACE_SITE_HEADER;
 *   subjectId: string;
 *   campaignId?: string | null;
 * }} payload
 */
export async function trackAdAnalyticsEvent(payload) {
  try {
    await apiClient.post("/analytics/track-ad", {
      kind: payload.kind,
      surface: payload.surface,
      subjectId: payload.subjectId,
      campaignId: payload.campaignId ?? null,
    });
  } catch (error) {
    // traffic analytics must not break UX
    reportClientIssue("trackAdAnalyticsEvent", error);
  }
}

export function trackIntroAdImpression(subjectId, campaignId = null) {
  return trackAdAnalyticsEvent({
    kind: ANALYTICS_AD_KIND_IMPRESSION,
    surface: ANALYTICS_AD_SURFACE_INTRO,
    subjectId,
    campaignId,
  });
}

export function trackIntroAdClick(subjectId, campaignId = null) {
  return trackAdAnalyticsEvent({
    kind: ANALYTICS_AD_KIND_CLICK,
    surface: ANALYTICS_AD_SURFACE_INTRO,
    subjectId,
    campaignId,
  });
}

export function trackSiteHeaderBannerImpression(subjectId, campaignId = null) {
  return trackAdAnalyticsEvent({
    kind: ANALYTICS_AD_KIND_IMPRESSION,
    surface: ANALYTICS_AD_SURFACE_SITE_HEADER,
    subjectId,
    campaignId,
  });
}

export function trackSiteHeaderBannerClick(subjectId, campaignId = null) {
  return trackAdAnalyticsEvent({
    kind: ANALYTICS_AD_KIND_CLICK,
    surface: ANALYTICS_AD_SURFACE_SITE_HEADER,
    subjectId,
    campaignId,
  });
}
