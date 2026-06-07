export const raffleQueryKeys = {
  all: ["raffles"],
  featured: () => [...raffleQueryKeys.all, "featured"],
  my: () => [...raffleQueryKeys.all, "my"],
  staffQueue: () => [...raffleQueryKeys.all, "staff", "queue"],
  staffPendingCount: () => [...raffleQueryKeys.all, "staff", "pending", "count"],
  /**
   * @param {string} raffleId
   */
  detail: (raffleId) => [...raffleQueryKeys.all, "detail", raffleId],
  /**
   * @param {string} raffleId
   * @param {{ limit?: number }} [params]
   */
  products: (raffleId, params = {}) => [
    ...raffleQueryKeys.all,
    "detail",
    raffleId,
    "products",
    params,
  ],
};
