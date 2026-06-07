export const userProfileQueryKeys = {
  all: ["user", "profile"],
  /**
   * @param {string} userId
   */
  byId: (userId) => [...userProfileQueryKeys.all, userId],
};
