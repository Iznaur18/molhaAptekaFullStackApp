import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { PRODUCT_CATEGORY_VALUES } from "./productWrite.js";

/** Синхрон с `server/constants/productCategoryTreeConstants.js`. */
export const PRODUCT_CATEGORY_SLUG_MAX_LENGTH = 80;
export const PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH = 120;
export const PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH = 40;
export const PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT = 30;

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORY_SLUG_INVALID_MESSAGE =
  "slug: только латиница a–z, цифры и дефис (например electronics-headphones)";

const categorySlugFieldSchema = z
  .string()
  .trim()
  .min(2, "slug: от 2 до 80 символов")
  .max(PRODUCT_CATEGORY_SLUG_MAX_LENGTH, "slug: от 2 до 80 символов")
  .regex(CATEGORY_SLUG_PATTERN, CATEGORY_SLUG_INVALID_MESSAGE);

const categoryLabelRuFieldSchema = z
  .string()
  .trim()
  .min(1)
  .max(PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH);

const searchKeywordsFieldSchema = z
  .array(
    z.string().trim().max(PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH),
  )
  .max(PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT)
  .optional();

export const productCategorySlugParamsSchema = z.object({
  categorySlug: z
    .string()
    .trim()
    .min(1, "categorySlug обязателен")
    .refine(
      (value) => PRODUCT_CATEGORY_VALUES.includes(value),
      "Неизвестная категория",
    ),
});

export const productCategoryIdParamsSchema = z.object({
  categoryId: mongoIdSchema,
});

export const createProductCategoryAdminBodySchema = z.object({
  slug: categorySlugFieldSchema,
  labelRu: categoryLabelRuFieldSchema,
  parentId: mongoIdSchema.nullable().optional(),
  isLeaf: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  legacyProductCategory: z.enum(PRODUCT_CATEGORY_VALUES).nullable().optional(),
  searchKeywords: searchKeywordsFieldSchema,
});

export const patchProductCategoryAdminBodySchema = z.object({
  slug: categorySlugFieldSchema.optional(),
  labelRu: categoryLabelRuFieldSchema.optional(),
  parentId: mongoIdSchema.nullable().optional(),
  isLeaf: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  legacyProductCategory: z
    .union([z.enum(PRODUCT_CATEGORY_VALUES), z.literal(""), z.null()])
    .optional(),
  searchKeywords: searchKeywordsFieldSchema,
});
