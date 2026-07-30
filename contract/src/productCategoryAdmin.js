import { z } from "zod";

import {
  PRODUCT_CHARACTERISTICS_MAX_ITEMS,
  PRODUCT_CATEGORY_VALUES,
} from "./productWrite.js";
import { mongoIdSchema } from "./mongoId.js";
/** Синхрон с `server/constants/productCategoryTreeConstants.js`. */
export const PRODUCT_CATEGORY_SLUG_MAX_LENGTH = 80;
export const PRODUCT_CATEGORY_LABEL_RU_MAX_LENGTH = 120;
export const PRODUCT_CATEGORY_SEARCH_KEYWORD_MAX_LENGTH = 40;
export const PRODUCT_CATEGORY_SEARCH_KEYWORDS_MAX_COUNT = 30;
/** Синхрон с `PRODUCT_CHARACTERISTIC_KEY_MAX_CHARS` в productWrite / server. */
export const PRODUCT_CATEGORY_DEFAULT_CHARACTERISTIC_KEY_MAX_CHARS = 50;

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

const defaultCharacteristicKeysFieldSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .max(PRODUCT_CATEGORY_DEFAULT_CHARACTERISTIC_KEY_MAX_CHARS),
  )
  .max(PRODUCT_CHARACTERISTICS_MAX_ITEMS)
  .optional();

export const productCategorySlugParamsSchema = z.object({
  categorySlug: categorySlugFieldSchema,
});

const legacyProductCategorySlugEnumSchema = z.enum(PRODUCT_CATEGORY_VALUES);

/** PATCH /product/category-displays/:categorySlug — tree slug или legacy enum. */
export const productCategoryDisplaySlugParamsSchema = z.object({
  categorySlug: z.union([categorySlugFieldSchema, legacyProductCategorySlugEnumSchema]),
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
  legacyProductCategory: categorySlugFieldSchema.nullable().optional(),
  searchKeywords: searchKeywordsFieldSchema,
  defaultCharacteristicKeys: defaultCharacteristicKeysFieldSchema,
});

export const deleteProductCategoryAdminBodySchema = z
  .object({
    reassignProductCategoryId: mongoIdSchema.optional(),
    detachProducts: z.boolean().optional(),
  })
  .default({});

export const patchProductCategoryAdminBodySchema = z.object({
  slug: categorySlugFieldSchema.optional(),
  labelRu: categoryLabelRuFieldSchema.optional(),
  parentId: mongoIdSchema.nullable().optional(),
  isLeaf: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  legacyProductCategory: z
    .union([categorySlugFieldSchema, z.literal(""), z.null()])
    .optional(),
  searchKeywords: searchKeywordsFieldSchema,
  defaultCharacteristicKeys: defaultCharacteristicKeysFieldSchema,
});
