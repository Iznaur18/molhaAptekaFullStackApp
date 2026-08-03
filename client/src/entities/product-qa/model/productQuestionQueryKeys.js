export const productQuestionQueryKeys = {
  all: ["product-qa"],
  /**
   * @param {string} productId
   */
  summary: (productId) => [...productQuestionQueryKeys.all, "summary", productId],
  /**
   * @param {string} productId
   */
  list: (productId) => [...productQuestionQueryKeys.all, "list", productId],
};
