import { z } from "zod";

import { ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH } from "./adminDisplay.js";

/** SSOT ключей CMS-бейджей — shared-lib/server re-export отсюда. */
/** @type {readonly ["original", "raffle", "affiliate", "listing_origin_own", "listing_origin_resale", "listing_origin_manufacturer", "price_market_above", "price_market_at", "price_market_below", "discount", "loyalty", "auction", "installment", "wholesale", "rental", "near_distance"]} */
export const PRODUCT_BADGE_EXPLAIN_KEY_VALUES = Object.freeze([
  "original",
  "raffle",
  "affiliate",
  "listing_origin_own",
  "listing_origin_resale",
  "listing_origin_manufacturer",
  "price_market_above",
  "price_market_at",
  "price_market_below",
  "discount",
  "loyalty",
  "auction",
  "installment",
  "wholesale",
  "rental",
  "near_distance",
]);

export const PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH = 2000;

export const productBadgeExplainKeyParamsSchema = z.object({
  badgeKey: z
    .string()
    .trim()
    .min(1, "badgeKey обязателен")
    .refine(
      (value) => PRODUCT_BADGE_EXPLAIN_KEY_VALUES.includes(value),
      "Неизвестный бейдж",
    ),
});

export const adminProductBadgeExplainPatchBodySchema = z.object({
  imageUrl: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        value.length <= ADMIN_DISPLAY_IMAGE_URL_MAX_LENGTH,
      "imageUrl слишком длинный",
    ),
  description: z
    .union([z.string(), z.null()])
    .optional()
    .refine(
      (value) =>
        value === undefined ||
        value === null ||
        value.length <= PRODUCT_BADGE_EXPLAIN_DESCRIPTION_MAX_LENGTH,
      "description слишком длинный",
    ),
  resetImageUrl: z.boolean().optional(),
  resetDescription: z.boolean().optional(),
});
