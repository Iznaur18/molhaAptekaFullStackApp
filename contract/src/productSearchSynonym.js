import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { PRODUCT_CATEGORY_VALUES } from "./productWrite.js";

/** Синхрон с `server/constants/productSearchSynonymConstants.js`. */
export const PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH = 3;
export const PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH = 64;
export const PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX = 12;

const synonymTokenSchema = z
  .string()
  .trim()
  .min(PRODUCT_SEARCH_SYNONYM_MIN_TOKEN_LENGTH)
  .max(PRODUCT_SEARCH_SYNONYM_TOKEN_MAX_LENGTH);

const synonymCategoriesSchema = z
  .array(z.enum(PRODUCT_CATEGORY_VALUES))
  .min(1)
  .max(PRODUCT_SEARCH_SYNONYM_CATEGORIES_MAX);

export const productSearchSynonymIdParamsSchema = z.object({
  synonymId: mongoIdSchema,
});

export const createProductSearchSynonymBodySchema = z.object({
  token: synonymTokenSchema,
  categories: synonymCategoriesSchema,
});

export const patchProductSearchSynonymBodySchema = z.object({
  token: synonymTokenSchema.optional(),
  categories: synonymCategoriesSchema.optional(),
});
