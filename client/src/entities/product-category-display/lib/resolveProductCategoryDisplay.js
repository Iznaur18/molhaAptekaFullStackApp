import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../product/model/productConstants.js";

/** SVG data-uri — нейтральная иконка категории до кастома admin. */
export const PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='12' fill='%23eef2ff'/%3E%3Cpath d='M20 42V26l12-8 12 8v16' stroke='%236366f1' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/**
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {Map<import('./types.js').ProductCategoryDisplayFromApi['categorySlug'], import('./types.js').ProductCategoryDisplayFromApi>}
 */
export function mapCategoryDisplaysBySlug(displays) {
  return new Map(
    displays.map((row) => [row.categorySlug, row]),
  );
}

/**
 * @param {import('../../product/model/types.js').ProductCategory} categorySlug
 * @param {Map<import('../../product/model/types.js').ProductCategory, import('./types.js').ProductCategoryDisplayFromApi>} [overridesBySlug]
 * @returns {import('./types.js').ResolvedProductCategoryDisplay}
 */
export function resolveProductCategoryDisplay(categorySlug, overridesBySlug) {
  const override = overridesBySlug?.get(categorySlug);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    categorySlug,
    label: customLabel ?? PRODUCT_CATEGORY_LABEL_RU[categorySlug] ?? categorySlug,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
}

/**
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {import('./types.js').ResolvedProductCategoryDisplay[]}
 */
export function buildResolvedProductCategoryDisplays(displays) {
  const overridesBySlug = mapCategoryDisplaysBySlug(displays);
  return PRODUCT_CATEGORIES.map((categorySlug) =>
    resolveProductCategoryDisplay(categorySlug, overridesBySlug),
  );
}
