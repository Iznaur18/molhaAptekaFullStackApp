import { loyaltyPointsQueryKeys } from "../model/loyaltyPointsQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateLoyaltyPointsStatus(queryClient) {
  return queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
}
