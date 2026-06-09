import mongoose from "mongoose";

import ProductCategoryModel from "../models/ProductCategoryModel.js";
import { getProductCategoryDescendantIds } from "./getProductCategoryDescendantIds.js";

const { isValidObjectId, Types } = mongoose;

/**
 * @param {unknown} raw
 * @returns {string | null}
 */
export const parseCategoryIdFromQuery = (raw) => {
  if (raw == null || String(raw).trim() === "") {
    return null;
  }
  const value = String(raw).trim();
  return isValidObjectId(value) ? value : null;
};

/**
 * @param {Record<string, unknown>} baseQuery
 * @param {{ categoryId?: string | null; productCategory?: string | null }} filters
 */
export const mergeProductCatalogCategoryFilter = async (
  baseQuery,
  { categoryId = null, productCategory = null } = {},
) => {
  const merged = { ...baseQuery };

  if (categoryId) {
    const root = await ProductCategoryModel.findById(categoryId)
      .select("slug legacyProductCategory")
      .lean();
    const descendantIds = await getProductCategoryDescendantIds(categoryId);
    const legacySlugs = new Set();

    if (typeof root?.slug === "string" && root.slug.trim()) {
      legacySlugs.add(root.slug.trim());
    }
    if (
      typeof root?.legacyProductCategory === "string" &&
      root.legacyProductCategory.trim()
    ) {
      legacySlugs.add(root.legacyProductCategory.trim());
    }

    const categoryMatchers = [];

    if (descendantIds.length > 0) {
      categoryMatchers.push({
        productCategoryId: {
          $in: descendantIds.map((id) => new Types.ObjectId(id)),
        },
      });
    }

    if (legacySlugs.size > 0) {
      categoryMatchers.push({
        productCategory: { $in: [...legacySlugs] },
      });
    }

    if (categoryMatchers.length === 1) {
      Object.assign(merged, categoryMatchers[0]);
    } else if (categoryMatchers.length > 1) {
      merged.$and = [...(merged.$and ?? []), { $or: categoryMatchers }];
    }
  }

  if (productCategory) {
    merged.productCategory = productCategory;
  }

  return merged;
};

/**
 * id узлов дерева + потомки для текстового поиска.
 *
 * @param {ReturnType<import('./resolveProductSearchIntent.js').resolveProductSearchIntent>} intent
 */
export const findProductCategoryIdsForSearchIntent = async (intent) => {
  if (!intent.hasTextSearch) {
    return [];
  }

  const regex = intent.regexCondition;
  const nodes = await ProductCategoryModel.find({
    $or: [
      { labelRu: regex },
      { slug: regex },
      { searchKeywords: regex },
      { pathLabelRu: regex },
    ],
  })
    .select("_id")
    .lean();

  const idSet = new Set();

  for (const node of nodes) {
    const ids = await getProductCategoryDescendantIds(String(node._id));
    ids.forEach((id) => idSet.add(id));
  }

  for (const legacySlug of intent.categorySlugs) {
    const root = await ProductCategoryModel.findOne({
      parentId: null,
      $or: [{ legacyProductCategory: legacySlug }, { slug: legacySlug }],
    })
      .select("_id")
      .lean();

    if (!root) {
      continue;
    }

    const ids = await getProductCategoryDescendantIds(String(root._id));
    ids.forEach((id) => idSet.add(id));
  }

  return [...idSet];
};
