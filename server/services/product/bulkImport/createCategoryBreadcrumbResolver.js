import ProductCategoryModel from "../../../models/ProductCategoryModel.js";
import { resolveProductCategoryWriteFromId } from "../resolveProductCategoryWrite.js";
import { PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR } from "../resolveProductCategoryWrite.js";

import {
  buildLeafCategoryBreadcrumbPath,
  normalizeCategoryBreadcrumbKey,
  parseCategoryBreadcrumbParts,
} from "./buildLeafCategoryBreadcrumbPath.js";

/**
 * @returns {Promise<{
 *   resolve: (rawPath: string) => Promise<Awaited<ReturnType<typeof resolveProductCategoryWriteFromId>>>;
 * }>}
 */
export async function createCategoryBreadcrumbResolver() {
  const leaves = await ProductCategoryModel.find({ isLeaf: true })
    .select("pathLabelRu labelRu")
    .lean();

  /** @type {Map<string, import('mongoose').LeanDocument<any>>} */
  const byFullPathKey = new Map();
  /** @type {Map<string, Array<{ leaf: import('mongoose').LeanDocument<any>; path: string }>>} */
  const byLeafLabel = new Map();

  for (const leaf of leaves) {
    const path = buildLeafCategoryBreadcrumbPath(leaf);
    byFullPathKey.set(normalizeCategoryBreadcrumbKey(path), leaf);

    const labelKey = String(leaf.labelRu ?? "").trim().toLowerCase();
    if (!labelKey) {
      continue;
    }
    if (!byLeafLabel.has(labelKey)) {
      byLeafLabel.set(labelKey, []);
    }
    byLeafLabel.get(labelKey).push({ leaf, path });
  }

  return {
    async resolve(rawPath) {
      const trimmed = String(rawPath ?? "").trim();
      const inputKey = normalizeCategoryBreadcrumbKey(trimmed);
      if (!inputKey) {
        throw new Error("Укажите категорию");
      }

      const exact = byFullPathKey.get(inputKey);
      if (exact) {
        return resolveProductCategoryWriteFromId(exact._id);
      }

      const parts = parseCategoryBreadcrumbParts(trimmed);
      if (parts.length === 1) {
        const matches = byLeafLabel.get(parts[0].toLowerCase()) ?? [];
        if (matches.length === 1) {
          return resolveProductCategoryWriteFromId(matches[0].leaf._id);
        }
        if (matches.length > 1) {
          throw new Error(
            `Несколько категорий «${parts[0]}». Укажите полный путь, например: ${matches[0].path}`,
          );
        }
      }

      throw new Error(
        `Категория не найдена: «${trimmed}». Скопируйте путь из листа «Категории» в шаблоне (разделитель ${PRODUCT_CATEGORY_BREADCRUMB_SEPARATOR} или >).`,
      );
    },
  };
}
