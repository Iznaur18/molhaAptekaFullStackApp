export const cartProductsQueryKeys = {
  root: /** @type {const} */ (["cart", "products"]),
  /**
   * @param {string[]} productIds
   */
  byIds(productIds) {
    const sorted = [...new Set(productIds.map(String).filter(Boolean))].sort();
    return /** @type {const} */ ([...cartProductsQueryKeys.root, sorted.join(",")]);
  },
};
