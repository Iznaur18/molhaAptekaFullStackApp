import { USER_PROFILE_PRODUCTS_PAGE_SIZE } from "../api/fetchUserProducts.js";

export const userProfileProductsQueryKeys = {
  all: ["user", "profile", "products"],
  /**
   * @param {string} userId
   * @param {{ page?: number; limit?: number }} [params]
   */
  list: (userId, params = {}) => [
    ...userProfileProductsQueryKeys.all,
    userId,
    {
      page: params.page ?? 1,
      limit: params.limit ?? USER_PROFILE_PRODUCTS_PAGE_SIZE,
    },
  ],
  /**
   * @param {string} userId
   */
  allPages: (userId) => [...userProfileProductsQueryKeys.all, userId, "all"],
};
