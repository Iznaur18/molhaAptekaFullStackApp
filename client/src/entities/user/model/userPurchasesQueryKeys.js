export const userPurchasesQueryKeys = {
  all: ["user", "purchases"],
  /**
   * @param {string} userId
   */
  byUserId: (userId) => [...userPurchasesQueryKeys.all, userId],
};
