import { resolveProductDiscountPercent } from "./computeProductDiscountPercent.js";
import { PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT } from "./productSaleConstants.js";

/**
 * @param {import("../model/types.js").ProductFromApi | Record<string, unknown> | null | undefined} product
 */
export function isProductOnSale(product) {
  if (product == null) {
    return false;
  }
  const discountPercent = resolveProductDiscountPercent(product);
  if (discountPercent == null) {
    return false;
  }
  return discountPercent >= PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT;
}
