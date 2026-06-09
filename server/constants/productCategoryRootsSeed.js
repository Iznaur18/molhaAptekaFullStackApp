import { PRODUCT_CATEGORY_LABEL_RU } from "./productCategoryLabels.js";
import { PRODUCT_CATEGORY_VALUES } from "./productConstants.js";

/**
 * Корневые категории каталога (миграция legacy enum → ProductCategory).
 *
 * @typedef {{
 *   slug: string;
 *   labelRu: string;
 *   parentSlug: null;
 *   isLeaf: false;
 *   legacyProductCategory: string;
 *   sortOrder: number;
 * }} ProductCategoryRootSeedNode
 */

/** @type {ProductCategoryRootSeedNode[]} */
export const PRODUCT_CATEGORY_ROOTS_SEED = PRODUCT_CATEGORY_VALUES.map(
  (slug, index) => ({
    slug,
    labelRu: PRODUCT_CATEGORY_LABEL_RU[slug] ?? slug,
    parentSlug: null,
    isLeaf: false,
    legacyProductCategory: slug,
    sortOrder: (index + 1) * 10,
  }),
);
