import { z } from "zod";

export const ANALYTICS_AD_KIND_IMPRESSION = "impression";
export const ANALYTICS_AD_KIND_CLICK = "click";
export const ANALYTICS_AD_KINDS = [
  ANALYTICS_AD_KIND_IMPRESSION,
  ANALYTICS_AD_KIND_CLICK,
];

export const ANALYTICS_AD_SURFACE_INTRO = "intro_ad";
export const ANALYTICS_AD_SURFACE_SITE_HEADER = "site_header_banner";
export const ANALYTICS_AD_SURFACES = [
  ANALYTICS_AD_SURFACE_INTRO,
  ANALYTICS_AD_SURFACE_SITE_HEADER,
];

export const trackAdAnalyticsBodySchema = z.object({
  kind: z.enum(ANALYTICS_AD_KINDS),
  surface: z.enum(ANALYTICS_AD_SURFACES),
  subjectId: z.string().trim().min(1).max(128),
  campaignId: z.string().trim().max(128).optional().nullable(),
});
