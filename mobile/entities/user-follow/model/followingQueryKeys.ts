export const followingQueryKeys = {
  all: ["user", "following"] as const,
  list: (params: { page?: number; limit?: number } = {}) =>
    [...followingQueryKeys.all, params] as const,
};
