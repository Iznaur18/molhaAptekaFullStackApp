import { z } from "zod";

import {
  APP_INTRO_FADE_OUT_MS_MAX,
  APP_INTRO_FADE_OUT_MS_MIN,
  APP_INTRO_FALLBACK_HINT_MAX_LENGTH,
  APP_INTRO_FALLBACK_TITLE_MAX_LENGTH,
  APP_INTRO_MAX_MS_MAX,
  APP_INTRO_MAX_MS_MIN,
  APP_INTRO_MIN_MS_MAX,
  APP_INTRO_MIN_MS_MIN,
} from "./appIntro.js";

export const INTRO_AD_PRICE_POINTS = 30_000;
export const INTRO_AD_DURATION_DAYS = 3;
/** Максимальная длительность intro-ролика: сервер обрезает видео при загрузке. */
export const INTRO_AD_VIDEO_MAX_DURATION_SEC = 10;

const optionalTrimmedMediaUrl = z.preprocess((value) => {
  if (value === undefined) {
    return undefined;
  }
  if (value == null || String(value).trim() === "") {
    return null;
  }
  return String(value).trim();
}, z.string().max(2048).nullable().optional());

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

const timingMsSchema = (min, max) => z.coerce.number().int().min(min).max(max).optional();

export const submitIntroAdCampaignBodySchema = z
  .object({
    videoMp4Url: z.string().trim().min(1).max(2048),
    videoWebmUrl: optionalTrimmedMediaUrl,
    posterUrl: optionalTrimmedMediaUrl,
    fallbackTitle: optionalTrimmedText(APP_INTRO_FALLBACK_TITLE_MAX_LENGTH),
    fallbackHint: optionalTrimmedText(APP_INTRO_FALLBACK_HINT_MAX_LENGTH),
    minMs: timingMsSchema(APP_INTRO_MIN_MS_MIN, APP_INTRO_MIN_MS_MAX),
    maxMs: timingMsSchema(APP_INTRO_MAX_MS_MIN, APP_INTRO_MAX_MS_MAX),
    fadeOutMs: timingMsSchema(APP_INTRO_FADE_OUT_MS_MIN, APP_INTRO_FADE_OUT_MS_MAX),
  })
  .superRefine((body, ctx) => {
    if (body.minMs != null && body.maxMs != null && body.maxMs < body.minMs) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "maxMs не может быть меньше minMs",
        path: ["maxMs"],
      });
    }
  });

export const rejectIntroAdCampaignBodySchema = z.object({
  reason: z.string().trim().max(500).optional().nullable(),
});

export const introAdCampaignIdParamsSchema = z.object({
  campaignId: z.string().trim().min(1),
});

export const introAdCampaignSchema = z.object({
  _id: z.string(),
  advertiserId: z.string(),
  status: z.string(),
  videoMp4Url: z.string().nullable(),
  videoWebmUrl: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  fallbackTitle: z.string().nullable().optional(),
  fallbackHint: z.string().nullable().optional(),
  minMs: z.number().nullable().optional(),
  maxMs: z.number().nullable().optional(),
  fadeOutMs: z.number().nullable().optional(),
  amountPoints: z.number().nullable().optional(),
  pointsReservedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsChargedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pointsReleasedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  approvedByUserId: z.string().nullable().optional(),
  rejectedReason: z.string().nullable().optional(),
  scheduledStartAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  activatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  activeUntil: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  pausedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  cancelledByUserId: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const introAdConfigDataSchema = z.object({
  pricePoints: z.number().int(),
  durationDays: z.number(),
});

export const myIntroAdCampaignDataSchema = z.object({
  campaign: introAdCampaignSchema.nullable(),
  pricePoints: z.number().int(),
});

export const pendingIntroAdCampaignsDataSchema = z.object({
  campaigns: z.array(
    introAdCampaignSchema.extend({
      advertiser: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const pendingIntroAdCampaignsCountDataSchema = z.object({
  count: z.number().int(),
});

export const managedIntroAdCampaignsDataSchema = z.object({
  campaigns: z.array(
    introAdCampaignSchema.extend({
      advertiser: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const submitIntroAdCampaignDataSchema = z.object({
  message: z.string(),
  campaign: introAdCampaignSchema,
  loyaltyPointsBalance: z.number().nullable().optional(),
});

export const cancelIntroAdCampaignDataSchema = z.object({
  message: z.string(),
});
