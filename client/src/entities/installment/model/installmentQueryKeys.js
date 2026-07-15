export const installmentQueryKeys = {
  all: ["installment"],
  /**
   * @param {{ status?: string }} params
   */
  myContracts: (params) => [...installmentQueryKeys.all, "my-contracts", params],
  /**
   * @param {{ status?: string }} params
   */
  mySales: (params) => [...installmentQueryKeys.all, "my-sales", params],
  disputesPending: () => [...installmentQueryKeys.all, "disputes", "pending"],
  disputesPendingCount: () => [
    ...installmentQueryKeys.all,
    "disputes",
    "pending",
    "count",
  ],
  buyerActionCount: () => [...installmentQueryKeys.all, "buyer", "action-count"],
  sellerActionCount: () => [...installmentQueryKeys.all, "seller", "action-count"],
  /**
   * @param {string} productId
   */
  program: (productId) => [...installmentQueryKeys.all, "program", productId],
};
