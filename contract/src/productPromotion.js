import { z } from "zod";

/** SSOT продвижения товара — client/mobile/server re-export отсюда. */
export const PRODUCT_PROMOTION_STATUS_PENDING_STAFF = "pending_staff";
export const PRODUCT_PROMOTION_STATUS_ACTIVE = "active";
export const PRODUCT_PROMOTION_STATUS_EXPIRED = "expired";
export const PRODUCT_PROMOTION_STATUS_REJECTED = "rejected";
export const PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN = "cancelled_by_admin";

export const PRODUCT_PROMOTION_STATUSES = [
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
  PRODUCT_PROMOTION_STATUS_REJECTED,
  PRODUCT_PROMOTION_STATUS_CANCELLED_BY_ADMIN,
];

export const PRODUCT_PROMOTION_TIER_GOLD = 1;
export const PRODUCT_PROMOTION_TIER_TOP = 2;
export const PRODUCT_PROMOTION_TIER_BANNER = 3;

export const PRODUCT_PROMOTION_TIERS = [
  PRODUCT_PROMOTION_TIER_GOLD,
  PRODUCT_PROMOTION_TIER_TOP,
  PRODUCT_PROMOTION_TIER_BANNER,
];

/** Доля от productPrice: L1 0.2%, L2 0.4%, L3 1%. */
export const PRODUCT_PROMOTION_TIER_RATES = {
  [PRODUCT_PROMOTION_TIER_GOLD]: 0.002,
  [PRODUCT_PROMOTION_TIER_TOP]: 0.004,
  [PRODUCT_PROMOTION_TIER_BANNER]: 0.01,
};

export const PRODUCT_PROMOTION_DURATION_CODES = ["24h", "7d", "30d"];

export const PRODUCT_PROMOTION_DURATION_OPTIONS = [
  { code: "24h", durationHours: 24, durationMult: 1 },
  { code: "7d", durationHours: 24 * 7, durationMult: 6 },
  { code: "30d", durationHours: 24 * 30, durationMult: 23 },
];

export const PRODUCT_PROMOTION_DURATION_MULT = Object.fromEntries(
  PRODUCT_PROMOTION_DURATION_OPTIONS.map((item) => [item.code, item.durationMult]),
);

/**
 * @param {string} code
 */
export const findProductPromotionDuration = (code) =>
  PRODUCT_PROMOTION_DURATION_OPTIONS.find((item) => item.code === code) ?? null;

export const PRODUCT_PROMOTION_REJECT_COMMENT_MAX_CHARS = 500;

export const requestProductPromotionBodySchema = z.object({
  tier: z.coerce
    .number({ required_error: "tier обязателен" })
    .int("tier обязателен")
    .refine(
      (value) => PRODUCT_PROMOTION_TIERS.includes(value),
      "Неверный уровень продвижения",
    ),
  tariffCode: z
    .string({ required_error: "tariffCode обязателен" })
    .trim()
    .min(1, "tariffCode обязателен")
    .refine(
      (value) => PRODUCT_PROMOTION_DURATION_CODES.includes(value),
      "Неверный срок продвижения",
    ),
  idempotencyKey: z
    .string({ required_error: "Укажите idempotencyKey" })
    .trim()
    .min(1, "Укажите idempotencyKey")
    .max(64),
});

export const myProductPromotionsQuerySchema = z.object({
  status: z.enum(PRODUCT_PROMOTION_STATUSES).optional(),
});

export const rejectProductPromotionBodySchema = z.object({
  comment: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        value.length <= PRODUCT_PROMOTION_REJECT_COMMENT_MAX_CHARS,
      `comment не длиннее ${PRODUCT_PROMOTION_REJECT_COMMENT_MAX_CHARS} символов`,
    ),
});
