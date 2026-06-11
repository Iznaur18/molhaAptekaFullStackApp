import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { productFromApiSchema } from "./productFromApi.js";

const wishlistAddedAtSchema = z.coerce
  .number()
  .int()
  .positive("addedAt должен быть положительным timestamp (мс)");

/** `items`: productId → addedAt (мс). */
export const wishlistItemsRecordSchema = z.record(mongoIdSchema, wishlistAddedAtSchema);

/** Тело `PUT /favorites`. */
export const replaceFavoritesBodySchema = z.object({
  items: wishlistItemsRecordSchema,
});

/** `data` ответа `GET|PUT /favorites`. */
export const favoritesListDataSchema = z.object({
  items: wishlistItemsRecordSchema,
  products: z.array(productFromApiSchema),
});
