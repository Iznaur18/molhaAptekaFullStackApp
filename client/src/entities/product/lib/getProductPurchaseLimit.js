/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function getProductPurchaseLimit(product) {
  if (!product) {
    return 0;
  }
  if (product.productOutOfStock === true) {
    return 0;
  }
  const raw = product.productAvailableQuantity ?? product.productStockQuantity ?? 0;
  return Math.max(0, Math.floor(Number(raw) || 0));
}
