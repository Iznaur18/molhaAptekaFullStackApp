export const productReviewQueryKeys = {
  all: ["product-review"],
  /**
   * @param {string} productId
   */
  summary: (productId) => [...productReviewQueryKeys.all, "summary", productId],
  /**
   * @param {string} productId
   */
  list: (productId) => [...productReviewQueryKeys.all, "list", productId],
};
