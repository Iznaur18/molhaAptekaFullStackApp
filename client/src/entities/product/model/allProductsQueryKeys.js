export const allProductsQueryKeys = {
  all: ["catalog", "all-products"],
  /**
   * @param {{ search?: string }} [params]
   */
  list: (params = {}) => [...allProductsQueryKeys.all, params],
};
