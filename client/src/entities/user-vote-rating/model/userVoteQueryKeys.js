export const userVoteQueryKeys = {
  all: ["user-vote"],
  /**
   * @param {string} targetUserId
   */
  myForTarget: (targetUserId) => [...userVoteQueryKeys.all, "my", targetUserId],
};
