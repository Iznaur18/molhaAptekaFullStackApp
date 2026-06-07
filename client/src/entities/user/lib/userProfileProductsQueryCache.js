import { userProfileProductsQueryKeys } from "../model/userProfileProductsQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} userId
 */
export function invalidateUserProfileProducts(queryClient, userId) {
  return queryClient.invalidateQueries({
    queryKey: [...userProfileProductsQueryKeys.all, userId],
  });
}
