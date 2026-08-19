import { z } from "zod";

import { mongoIdSchema } from "./mongoId.js";
import { formatCuratedRegionLabel } from "./curatedProductList.js";
import { requiredRuRegionCodeFieldSchema } from "./ruRegions.js";

export const CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH = 60;

export const CURATED_CATEGORY_ITEM_KINDS = ["tree", "personal"];

const curatedCategoryListTitleSchema = z
  .string()
  .trim()
  .min(1, "Укажите заголовок списка")
  .max(CURATED_CATEGORY_LIST_TITLE_MAX_LENGTH, "Слишком длинный заголовок");

const curatedCategoryItemKindSchema = z.enum(CURATED_CATEGORY_ITEM_KINDS);

export const curatedCategoryListIdParamsSchema = z.object({
  listId: mongoIdSchema,
});

export const curatedCategoryListItemParamsSchema = z.object({
  listId: mongoIdSchema,
  itemKey: z.string().trim().min(1),
});

export const curatedCategoryItemPreviewQuerySchema = z.object({
  kind: curatedCategoryItemKindSchema,
  refId: mongoIdSchema,
});

export const createCuratedCategoryListBodySchema = z.object({
  title: curatedCategoryListTitleSchema,
  regionCode: requiredRuRegionCodeFieldSchema,
});

export const patchCuratedCategoryListBodySchema = z.object({
  title: curatedCategoryListTitleSchema.optional(),
  regionCode: requiredRuRegionCodeFieldSchema.optional(),
});

export const reorderCuratedCategoryListsBodySchema = z.object({
  orderedListIds: z.array(mongoIdSchema).min(1),
});

export const addCuratedCategoryListItemBodySchema = z.object({
  kind: curatedCategoryItemKindSchema,
  refId: mongoIdSchema,
});

/**
 * @param {string | null | undefined} itemRegionCode
 * @param {string | null | undefined} listRegionCode
 */
export function formatCuratedCategoryRegionMismatchMessage(
  itemRegionCode,
  listRegionCode,
) {
  const itemLabel = formatCuratedRegionLabel(itemRegionCode);
  const listLabel = formatCuratedRegionLabel(listRegionCode);
  return `Регион категории (${itemLabel}) не совпадает с регионом подборки (${listLabel})`;
}

/**
 * @param {"tree" | "personal"} kind
 * @param {string} refId
 */
export function buildCuratedCategoryItemKey(kind, refId) {
  return `${kind}:${refId}`;
}

/**
 * @param {string} itemKey
 */
export function parseCuratedCategoryItemKey(itemKey) {
  const [kind, refId] = String(itemKey ?? "").split(":");
  if (!CURATED_CATEGORY_ITEM_KINDS.includes(kind) || !refId) {
    return null;
  }
  return { kind, refId };
}
