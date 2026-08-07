import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import {
  getRuRegionByCode,
  requiredRuRegionCodeFieldSchema,
  resolveViewerRegionCode,
} from "./ruRegions.js";

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

export const curatedProductPreviewParamsSchema = z.object({
  productId: mongoIdSchema,
});

export const createCuratedProductListBodySchema = z.object({
  title: curatedListTitleSchema,
  regionCode: requiredRuRegionCodeFieldSchema,
});

export const patchCuratedProductListBodySchema = z.object({
  title: curatedListTitleSchema.optional(),
  regionCode: requiredRuRegionCodeFieldSchema.optional(),
});

export const reorderCuratedProductListsBodySchema = z.object({
  orderedListIds: z.array(mongoIdSchema).min(1),
});

export const addCuratedProductListItemBodySchema = z.object({
  productId: mongoIdSchema,
});

/**
 * @param {string | null | undefined} regionCode
 */
export function formatCuratedRegionLabel(regionCode) {
  const code = resolveViewerRegionCode(regionCode);
  return getRuRegionByCode(code)?.name ?? code;
}

/**
 * @param {string | null | undefined} productRegionCode
 * @param {string | null | undefined} listRegionCode
 */
export function formatCuratedProductRegionMismatchMessage(
  productRegionCode,
  listRegionCode,
) {
  const productLabel = formatCuratedRegionLabel(productRegionCode);
  const listLabel = formatCuratedRegionLabel(listRegionCode);
  return `Регион товара (${productLabel}) не совпадает с регионом подборки (${listLabel})`;
}
