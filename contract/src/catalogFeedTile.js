import { z } from "zod";

/** Синхрон с `server/constants/catalogFeedTileConstants.js`. */
export const CATALOG_FEED_TILE_KEY_VALUES = [
  "sort:newest",
  "sort:views",
  "sort:purchases",
  "sort:city",
  "sort:reviews",
  "sort:premium",
  "sort:confirmed",
  "filter:__following_only__",
  "filter:__auction_only__",
  "filter:__installment_only__",
  "filter:__sale_only__",
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
