import { z } from "zod";

/** Синхрон с `server/constants/productPromotionConstants.js`. */
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

export const PRODUCT_PROMOTION_DURATION_CODES = ["24h", "7d", "30d"];

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
});

export const myProductPromotionsQuerySchema = z.object({
  status: z.enum(PRODUCT_PROMOTION_STATUSES).optional(),
});
