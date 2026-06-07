export const priceOfferQueryKeys = {
  all: ["price-offers"],
  myBids: () => [...priceOfferQueryKeys.all, "my-bids"],
  incoming: () => [...priceOfferQueryKeys.all, "incoming"],
  incomingPendingCount: () => [...priceOfferQueryKeys.all, "incoming", "pending-count"],
  /**
   * @param {string} productId
   */
  seller: (productId) => [...priceOfferQueryKeys.all, "seller", productId],
  /**
   * @param {string} productId
   */
  sellerArchive: (productId) => [...priceOfferQueryKeys.all, "seller", productId, "archive"],
  /**
   * @param {string} productId
   */
  myForProduct: (productId) => [...priceOfferQueryKeys.all, "my", productId],
  /**
   * @param {string} productId
   */
  topForProduct: (productId) => [...priceOfferQueryKeys.all, "top", productId],
};
