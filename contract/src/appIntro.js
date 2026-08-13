import { z } from "zod";

/** Синхрон с `server/constants/appIntroSettingsConstants.js`. */
export const APP_INTRO_FALLBACK_TITLE_DEFAULT = "Torgum";
export const APP_INTRO_FALLBACK_HINT_DEFAULT = "Добро пожаловать";
export const APP_INTRO_MIN_MS_DEFAULT = 2000;
export const APP_INTRO_MAX_MS_DEFAULT = 8000;
export const APP_INTRO_FADE_OUT_MS_DEFAULT = 550;

export const APP_INTRO_FALLBACK_TITLE_MAX_LENGTH = 80;
export const APP_INTRO_FALLBACK_HINT_MAX_LENGTH = 200;
export const APP_INTRO_MIN_MS_MIN = 500;
export const APP_INTRO_MIN_MS_MAX = 30_000;
export const APP_INTRO_MAX_MS_MIN = 1000;
export const APP_INTRO_MAX_MS_MAX = 60_000;
export const APP_INTRO_FADE_OUT_MS_MIN = 100;
export const APP_INTRO_FADE_OUT_MS_MAX = 2000;

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

const timingMsSchema = (min, max) =>
  z.coerce.number().int().min(min).max(max).optional();

export const introAdPaidIntroSchema = z.object({
  advertiserId: z.string(),
  ctaType: z.enum(["seller_products", "profile"]),
  videoMp4Url: z.string().nullable(),
  videoWebmUrl: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  fallbackTitle: z.string(),
  fallbackHint: z.string(),
  minMs: z.number().int(),
  maxMs: z.number().int(),
  fadeOutMs: z.number().int(),
});

export const appIntroSettingsSchema = z.object({
  videoMp4Url: optionalTrimmedMediaUrl,
  videoWebmUrl: optionalTrimmedMediaUrl,
  posterUrl: optionalTrimmedMediaUrl,
  fallbackTitle: z.string().max(APP_INTRO_FALLBACK_TITLE_MAX_LENGTH),
  fallbackHint: z.string().max(APP_INTRO_FALLBACK_HINT_MAX_LENGTH),
  minMs: z.number().int().min(APP_INTRO_MIN_MS_MIN).max(APP_INTRO_MIN_MS_MAX),
  maxMs: z.number().int().min(APP_INTRO_MAX_MS_MIN).max(APP_INTRO_MAX_MS_MAX),
  fadeOutMs: z
    .number()
    .int()
    .min(APP_INTRO_FADE_OUT_MS_MIN)
    .max(APP_INTRO_FADE_OUT_MS_MAX),
  prioritizePlatformIntro: z.boolean().optional(),
  updatedAt: z.union([z.string(), z.date(), z.null()]).optional().nullable(),
});

export const appIntroSettingsDataSchema = z.object({
  settings: appIntroSettingsSchema,
  /** Первый активный платный ролик (обратная совместимость, веб-клиент). */
  paidIntro: introAdPaidIntroSchema.nullable().optional(),
  /** До 5 активных платных роликов, проигрываются подряд. */
  paidIntros: z.array(introAdPaidIntroSchema).optional().default([]),
});

export const patchAppIntroSettingsBodySchema = z
  .object({
    videoMp4Url: optionalTrimmedMediaUrl,
    videoWebmUrl: optionalTrimmedMediaUrl,
    posterUrl: optionalTrimmedMediaUrl,
    fallbackTitle: optionalTrimmedText(APP_INTRO_FALLBACK_TITLE_MAX_LENGTH),
    fallbackHint: optionalTrimmedText(APP_INTRO_FALLBACK_HINT_MAX_LENGTH),
    minMs: timingMsSchema(APP_INTRO_MIN_MS_MIN, APP_INTRO_MIN_MS_MAX),
    maxMs: timingMsSchema(APP_INTRO_MAX_MS_MIN, APP_INTRO_MAX_MS_MAX),
    fadeOutMs: timingMsSchema(APP_INTRO_FADE_OUT_MS_MIN, APP_INTRO_FADE_OUT_MS_MAX),
    prioritizePlatformIntro: z.boolean().optional(),
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

export const APP_INTRO_SETTINGS_DEFAULTS = {
  videoMp4Url: null,
  videoWebmUrl: null,
  posterUrl: null,
  fallbackTitle: APP_INTRO_FALLBACK_TITLE_DEFAULT,
  fallbackHint: APP_INTRO_FALLBACK_HINT_DEFAULT,
  minMs: APP_INTRO_MIN_MS_DEFAULT,
  maxMs: APP_INTRO_MAX_MS_DEFAULT,
  fadeOutMs: APP_INTRO_FADE_OUT_MS_DEFAULT,
};
