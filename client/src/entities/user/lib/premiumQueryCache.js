import { premiumQueryKeys } from "../model/premiumQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidatePremiumStatus(queryClient) {
  return queryClient.invalidateQueries({ queryKey: premiumQueryKeys.all });
}
