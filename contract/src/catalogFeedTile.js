import { z } from "zod";

/** Синхрон с `server/constants/catalogFeedTileConstants.js`. */
export const CATALOG_FEED_TILE_KEY_VALUES = [
  "sort:newest",
  "sort:views",
  "sort:purchases",
  "sort:reviews",
  "sort:premium",
  "sort:confirmed",
  "filter:__flash_sale_only__",
  "filter:__following_only__",
  "filter:__auction_only__",
  "filter:__installment_only__",
  "filter:__sale_only__",
  "filter:__rental_only__",
  "filter:__affiliate_only__",
  "filter:__wholesale_only__",
  "filter:__original_only__",
];

export const catalogFeedTileKeyParamsSchema = z.object({
  tileKey: z
    .string()
    .trim()
    .min(1, "tileKey обязателен")
    .refine(
      (value) => CATALOG_FEED_TILE_KEY_VALUES.includes(value),
      "Неизвестная подборка",
    ),
});
