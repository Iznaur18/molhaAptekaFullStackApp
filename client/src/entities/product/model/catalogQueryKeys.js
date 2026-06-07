export const catalogQueryKeys = {
  all: ["catalog", "products"],
  /**
   * @param {Record<string, unknown>} params
   */
  list: (params) => [...catalogQueryKeys.all, params],
  /**
   * @param {string} productId
   */
  byId: (productId) => [...catalogQueryKeys.all, "by-id", productId],
};
