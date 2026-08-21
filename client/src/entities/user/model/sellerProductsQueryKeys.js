export const sellerProductsQueryKeys = {
  all: ["user", "seller-products"],
  /**
   * @param {string} sellerId
   * @param {string | null} [shelfId]
   */
  list: (sellerId, shelfId = null) => [
    ...sellerProductsQueryKeys.all,
    sellerId,
    shelfId ? String(shelfId) : "all",
  ],
};
