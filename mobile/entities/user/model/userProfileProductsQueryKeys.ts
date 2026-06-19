export const userProfileProductsQueryKeys = {
  all: ["user", "profile-products"] as const,
  list: (userId: string, params: { page: number; limit: number }) =>
    [...userProfileProductsQueryKeys.all, userId, params] as const,
  allPages: (userId: string) => [...userProfileProductsQueryKeys.all, userId, "all-pages"] as const,
};
