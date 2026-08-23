/**
 * @param {import('../model/types.js').ProductFromApi | null | undefined} product
 */
export function isProductOutOfStock(product) {
  return product?.productOutOfStock === true;
}
