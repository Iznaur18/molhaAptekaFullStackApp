export const productReportQueryKeys = {
  all: ["product-report"],
  pending: () => [...productReportQueryKeys.all, "pending"],
  pendingCount: () => [...productReportQueryKeys.all, "pending", "count"],
  /**
   * @param {string} productId
   */
  myStatus: (productId) => [...productReportQueryKeys.all, "my-status", productId],
};
