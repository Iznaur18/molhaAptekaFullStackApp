/**
 * @param {import("../model/types.js").ProductFromApi | null | undefined} product
 */
export function hasProductManualCatalogDiscount(product) {
  if (product?.productFlashSaleEnabled === true) {
    return false;
  }
  const oldPrice = Math.floor(Number(product?.productOldPrice));
  const price = Math.floor(Number(product?.productPrice));
  if (!Number.isFinite(oldPrice) || !Number.isFinite(price)) {
    return false;
  }
  return oldPrice > price;
}
