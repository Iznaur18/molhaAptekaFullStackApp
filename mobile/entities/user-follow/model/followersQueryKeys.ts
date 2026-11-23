export const followersQueryKeys = {
  all: ["user", "followers"] as const,
  list: (params: { page?: number; limit?: number } = {}) =>
    [...followersQueryKeys.all, params] as const,
};