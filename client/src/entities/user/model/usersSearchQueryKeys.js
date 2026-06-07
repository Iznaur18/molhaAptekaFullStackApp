export const usersSearchQueryKeys = {
  all: ["users", "search"],
  /**
   * @param {string} search
   */
  list: (search) => [...usersSearchQueryKeys.all, search],
};
