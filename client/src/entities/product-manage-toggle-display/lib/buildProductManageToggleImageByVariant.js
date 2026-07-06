import { PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY } from "@izibuy/shared-lib";

/**
 * @param {import("../model/types.js").ProductManageToggleDisplayFromApi[]} displays
 */
export const buildProductManageToggleImageByVariant = (displays) => {
  const byKey = new Map(displays.map((row) => [row.toggleKey, row.imageUrl]));

  return Object.entries(PRODUCT_MANAGE_TOGGLE_VARIANT_BY_KEY).reduce((acc, [toggleKey, variant]) => {
    acc[variant] = byKey.get(toggleKey) ?? null;
    return acc;
  }, {});
};
