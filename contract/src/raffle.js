import { z } from "zod";

import { optionalLimitQuery, optionalPageQuery } from "./queryHelpers.js";
import { nullableProfileImageFocusSchema, profileImageFocusSchema } from "./userProfile.js";

/** Синхрон с `server/constants/raffleConstants.js`. */
export const RAFFLE_TARGET_SALES_MIN = 1;
export const RAFFLE_TARGET_SALES_MAX = 100_000;
export const RAFFLE_TITLE_MAX_LENGTH = 100;
export const RAFFLE_DESCRIPTION_MAX_LENGTH = 200;
export const RAFFLE_INSTAGRAM_URL_MAX_LENGTH = 500;
export const RAFFLE_PRIZE_MEDIA_TYPE_IMAGE = "image";
export const RAFFLE_PRIZE_MEDIA_TYPE_VIDEO = "video";
export const RAFFLE_PRIZE_MEDIA_TYPES = [
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
];
export const RAFFLE_REJECT_COMMENT_MAX_CHARS = 2000;

/** Стоимость создания розыгрыша (оплата баллами до формы). */
export const RAFFLE_CREATE_PRICE_POINTS = 3_000;

/**
 * @param {unknown} value
 */
function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\/.+/i.test(value.trim());
}

/**
 * @param {unknown} value
 */
function isMediaUrl(value) {
  return isHttpUrl(value) || (typeof value === "string" && value.trim().startsWith("/uploads/"));
}

/**
 * @param {unknown} raw
 */
function normalizePrizeMediaType(raw) {
  const value = String(raw ?? RAFFLE_PRIZE_MEDIA_TYPE_IMAGE).trim();
  return RAFFLE_PRIZE_MEDIA_TYPES.includes(value)
    ? value
    : RAFFLE_PRIZE_MEDIA_TYPE_IMAGE;
}

/**
 * @param {unknown} value
 * @param {import('zod').RefinementCtx} ctx
 * @param {string[]} path
 */
function assertDirectVideoUrl(value, ctx, path) {
  if (!isMediaUrl(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Укажите корректную ссылку на видео (http/https)",
      path,
    });
    return;
  }
  const trimmed = String(value).trim();
  const lower = trimmed.toLowerCase();
  const isUploadedAsset = lower.includes("/uploads/");
  const isDirectFile = /\.(mp4|webm)(\?|#|$)/i.test(trimmed);
  if (!isUploadedAsset && !isDirectFile) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Видео: прямая ссылка на MP4 или WebM, либо файл с сервера",
      path,
    });
  }
}

/**
 * @param {Record<string, unknown>} data
 * @param {import('zod').RefinementCtx} ctx
 */
function assertCreatePrizeMedia(data, ctx) {
  const type = normalizePrizeMediaType(data.prizeMediaType);
  if (type === RAFFLE_PRIZE_MEDIA_TYPE_IMAGE) {
    const url = String(data.prizeImageUrl ?? "").trim();
    if (!url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Добавьте фото приза",
        path: ["prizeImageUrl"],
      });
      return;
    }
    if (!isMediaUrl(url)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите корректную ссылку на изображение",
        path: ["prizeImageUrl"],
      });
    }
    return;
  }

  const videoUrl = String(data.prizeVideoUrl ?? "").trim();
  if (!videoUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Добавьте видео приза",
      path: ["prizeVideoUrl"],
    });
    return;
  }
  assertDirectVideoUrl(videoUrl, ctx, ["prizeVideoUrl"]);
}

const optionalHttpMediaUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .superRefine((value, ctx) => {
    if (value === undefined || value === "") return;
    if (!isHttpUrl(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите корректную ссылку",
      });
    }
  });

const rafflePrizeFieldsSchema = z.object({
  prizeMediaType: z.enum(RAFFLE_PRIZE_MEDIA_TYPES).optional(),
  prizeImageUrl: z.string().trim().optional().or(z.literal("")),
  prizeVideoUrl: z.string().trim().optional().or(z.literal("")),
  prizeImageFocus: nullableProfileImageFocusSchema,
});

export const createRaffleBodySchema = rafflePrizeFieldsSchema
  .extend({
    title: z
      .string()
      .trim()
      .min(1, "Укажите название розыгрыша")
      .max(RAFFLE_TITLE_MAX_LENGTH),
    description: z
      .union([z.string(), z.null()])
      .optional()
      .refine(
        (value) => value === undefined || value === null || value.length <= RAFFLE_DESCRIPTION_MAX_LENGTH,
        `description не длиннее ${RAFFLE_DESCRIPTION_MAX_LENGTH} символов`,
      ),
    targetSales: z.coerce
      .number()
      .int(`Цель: от ${RAFFLE_TARGET_SALES_MIN} до ${RAFFLE_TARGET_SALES_MAX}`)
      .min(RAFFLE_TARGET_SALES_MIN, `Цель: от ${RAFFLE_TARGET_SALES_MIN} до ${RAFFLE_TARGET_SALES_MAX}`)
      .max(RAFFLE_TARGET_SALES_MAX, `Цель: от ${RAFFLE_TARGET_SALES_MIN} до ${RAFFLE_TARGET_SALES_MAX}`),
    instagramUrl: z
      .string()
      .trim()
      .max(RAFFLE_INSTAGRAM_URL_MAX_LENGTH)
      .refine((value) => value.length === 0 || isHttpUrl(value), "Укажите корректную ссылку Instagram")
      .default(""),
  })
  .superRefine(assertCreatePrizeMedia);

export const patchRaffleBodySchema = rafflePrizeFieldsSchema
  .extend({
    title: z
      .string()
      .trim()
      .min(1)
      .max(RAFFLE_TITLE_MAX_LENGTH)
      .optional(),
    description: z
      .union([z.string(), z.null()])
      .optional()
      .refine(
        (value) => value === undefined || value === null || value.length <= RAFFLE_DESCRIPTION_MAX_LENGTH,
        `description не длиннее ${RAFFLE_DESCRIPTION_MAX_LENGTH} символов`,
      ),
    targetSales: z.coerce
      .number()
      .int()
      .min(RAFFLE_TARGET_SALES_MIN)
      .max(RAFFLE_TARGET_SALES_MAX)
      .optional(),
    instagramUrl: z
      .string()
      .trim()
      .max(RAFFLE_INSTAGRAM_URL_MAX_LENGTH)
      .refine((value) => value.length === 0 || isHttpUrl(value), "Укажите корректную ссылку Instagram")
      .optional(),
    prizeImageUrl: optionalHttpMediaUrl,
    prizeVideoUrl: optionalHttpMediaUrl,
    prizeImageFocus: z.union([profileImageFocusSchema, z.null()]).optional(),
  });

export const rejectRaffleBodySchema = z.object({
  comment: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) => value === undefined || value === null || value.length <= RAFFLE_REJECT_COMMENT_MAX_CHARS,
      `comment не длиннее ${RAFFLE_REJECT_COMMENT_MAX_CHARS} символов`,
    ),
});

export const raffleProductsQuerySchema = z.object({
  page: optionalPageQuery,
  limit: optionalLimitQuery,
});

export const setProductRaffleParticipationBodySchema = z.object({
  enabled: z.boolean({ required_error: "Укажите enabled: true/false" }),
});
