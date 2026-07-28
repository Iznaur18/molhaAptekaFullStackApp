import { z } from "zod";

import {
  SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH,
  SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH,
} from "./siteHeaderBanner.js";
import { requiredRuRegionCodeFieldSchema } from "./ruRegions.js";

export const SITE_HEADER_BANNER_CAMPAIGN_PRICE_POINTS = 7_000;
export const SITE_HEADER_BANNER_CAMPAIGN_DURATION_DAYS = 7;
export const SITE_HEADER_BANNER_CAMPAIGN_PAID_SLOT_LIMIT = 200;

export const SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING = "pending";
export const SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE = "active";
export const SITE_HEADER_BANNER_CAMPAIGN_STATUS_REJECTED = "rejected";
export const SITE_HEADER_BANNER_CAMPAIGN_STATUS_EXPIRED = "expired";
export const SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED = "cancelled";

export const SITE_HEADER_BANNER_CAMPAIGN_STATUSES = [
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_PENDING,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_ACTIVE,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_REJECTED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_EXPIRED,
  SITE_HEADER_BANNER_CAMPAIGN_STATUS_CANCELLED,
];

const optionalTrimmedText = (maxLength) =>
  z.preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (value == null || String(value).trim() === "") {
      return null;
    }
    return String(value).trim();
  }, z.string().max(maxLength).nullable().optional());

const hexColorSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}, z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/).nullable().optional());

export const submitSiteHeaderBannerCampaignBodySchema = z.object({
  imageUrl: z.string().trim().min(1).max(2048),
  imageAlt: z.string().trim().min(1).max(SITE_HEADER_BANNER_IMAGE_ALT_MAX_LENGTH),
  linkPath: optionalTrimmedText(SITE_HEADER_BANNER_LINK_PATH_MAX_LENGTH),
  backgroundColor: hexColorSchema,
  regionCode: requiredRuRegionCodeFieldSchema,
});

export const rejectSiteHeaderBannerCampaignBodySchema = z.object({
  reason: z.string().trim().max(500).optional().nullable(),
});

export const siteHeaderBannerCampaignIdParamsSchema = z.object({
  campaignId: z.string().trim().min(1),
});

export const siteHeaderBannerCampaignSchema = z.object({
  _id: z.string(),
  advertiserId: z.string(),
  status: z.string(),
  imageUrl: z.string(),
  imageAlt: z.string(),
  linkPath: z.string().nullable(),
  backgroundColor: z.string().nullable(),
  regionCode: z.string(),
  amountPoints: z.coerce.number(),
  pointsReservedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsChargedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsReleasedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  approvedByUserId: z.string().nullable().optional(),
  rejectedReason: z.string().nullable().optional(),
  activatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  activeUntil: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledByUserId: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const siteHeaderBannerCampaignConfigDataSchema = z.object({
  pricePoints: z.number(),
  durationDays: z.number(),
  paidSlotLimit: z.number(),
  activePaidSlots: z.number(),
});

export const mySiteHeaderBannerCampaignDataSchema = z.object({
  campaign: siteHeaderBannerCampaignSchema.nullable().default(null),
  pricePoints: z.coerce.number(),
  durationDays: z.coerce.number(),
  paidSlotLimit: z.coerce.number(),
  activePaidSlots: z.coerce.number(),
});

export const submitSiteHeaderBannerCampaignDataSchema = z.object({
  message: z.string(),
  campaign: siteHeaderBannerCampaignSchema,
  loyaltyPointsBalance: z.number().nullable().optional(),
});

export const siteHeaderBannerCampaignModerationListDataSchema = z.object({
  campaigns: z.array(
    siteHeaderBannerCampaignSchema.extend({
      advertiser: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const siteHeaderBannerCampaignModerationCountDataSchema = z.object({
  count: z.number(),
});

export const cancelSiteHeaderBannerCampaignDataSchema = z.object({
  message: z.string(),
});
