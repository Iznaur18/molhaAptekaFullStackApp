export const followersQueryKeys = {
  all: ["user", "followers"],
  /**
   * @param {{ page?: number; limit?: number }} params
   */
  list: (params) => [...followersQueryKeys.all, params],
};
