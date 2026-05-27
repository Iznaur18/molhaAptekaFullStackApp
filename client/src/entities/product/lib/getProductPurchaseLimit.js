import { PRODUCT_STOCK_SHOW_REMAINING_THRESHOLD } from "../model/productStockConstants.js";

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function getProductPurchaseLimit(product) {
  if (!product) {
    return 0;
  }
  const raw =
    product.productAvailableQuantity ?? product.productStockQuantity ?? 0;
  return Math.max(0, Math.floor(Number(raw) || 0));
}

/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function shouldShowProductRemainingStock(product) {
  const limit = getProductPurchaseLimit(product);
  return (
    limit > 0 && limit <= PRODUCT_STOCK_SHOW_REMAINING_THRESHOLD
  );
}
