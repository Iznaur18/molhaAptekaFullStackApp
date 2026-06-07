import { pendingDataConfirmationQueryKeys } from "../model/pendingDataConfirmationQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidatePendingDataConfirmationRequests(queryClient) {
  return queryClient.invalidateQueries({ queryKey: pendingDataConfirmationQueryKeys.all });
}
