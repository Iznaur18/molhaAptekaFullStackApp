export const userVoteQueryKeys = {
  all: ["user-vote"],
  /**
   * @param {string} targetUserId
   */
  myForTarget: (targetUserId) => [...userVoteQueryKeys.all, "my", targetUserId],
  received: () => [...userVoteQueryKeys.all, "received"],
  /**
   * @param {{ limit?: number }} params
   */
  receivedInfinite: (params) => [...userVoteQueryKeys.received(), "infinite", params],
};
