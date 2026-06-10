export { PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE } from "./resolveProductCategoryDisplay.js";

/**
 * @param {import('../model/types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {Map<string, import('../model/types.js').ProductCategoryDisplayFromApi>}
 */
export function mapCategoryDisplaysById(displays) {
  /** @type {Map<string, import('../model/types.js').ProductCategoryDisplayFromApi>} */
  const map = new Map();

  for (const row of displays) {
    if (typeof row.categoryId === "string" && row.categoryId.trim()) {
      map.set(row.categoryId.trim(), row);
    }
  }

  return map;
}

/**
 * @param {string} categoryId
 * @param {string} fallbackLabel
 * @param {Map<string, import('../model/types.js').ProductCategoryDisplayFromApi>} [overridesById]
 */
export function resolveProductCategoryNodeDisplay(
  categoryId,
  fallbackLabel,
  overridesById,
) {
  const override = overridesById?.get(categoryId);
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    categoryId,
    label: customLabel ?? fallbackLabel,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
}
