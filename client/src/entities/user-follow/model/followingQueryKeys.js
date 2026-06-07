export const followingQueryKeys = {
  all: ["user", "following"],
  /**
   * @param {{ page?: number; limit?: number }} params
   */
  list: (params) => [...followingQueryKeys.all, params],
};
