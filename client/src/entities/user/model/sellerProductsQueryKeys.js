export const sellerProductsQueryKeys = {
  all: ["user", "seller-products"],
  /**
   * @param {string} sellerId
   */
  list: (sellerId) => [...sellerProductsQueryKeys.all, sellerId],
};
