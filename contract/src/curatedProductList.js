import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";

export const CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH = 60;

const curatedListTitleSchema = z
  .string()
  .trim()
  .min(1, "Укажите заголовок списка")
  .max(CURATED_PRODUCT_LIST_TITLE_MAX_LENGTH, "Слишком длинный заголовок");

export const curatedProductListIdParamsSchema = z.object({
  listId: mongoIdSchema,
});

export const curatedProductListItemParamsSchema = z.object({
  listId: mongoIdSchema,
  productId: mongoIdSchema,
});

export const createCuratedProductListBodySchema = z.object({
  title: curatedListTitleSchema,
});

export const patchCuratedProductListBodySchema = z.object({
  title: curatedListTitleSchema.optional(),
});

export const reorderCuratedProductListsBodySchema = z.object({
  orderedListIds: z.array(mongoIdSchema).min(1),
});

export const addCuratedProductListItemBodySchema = z.object({
  productId: mongoIdSchema,
});
