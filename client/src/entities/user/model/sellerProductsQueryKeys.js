export const sellerProductsQueryKeys = {
  all: ["user", "seller-products"],
  /**
   * @param {string} sellerId
   * @param {string | null} [shelfId]
   * @param {string | null} [onecGroupId]
   */
  list: (sellerId, shelfId = null, onecGroupId = null) => [
    ...sellerProductsQueryKeys.all,
    sellerId,
    shelfId ? String(shelfId) : "all",
    onecGroupId ? String(onecGroupId) : "all",
  ],
};
