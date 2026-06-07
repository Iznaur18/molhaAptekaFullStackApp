import { moderationQueryKeys } from "../model/moderationQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateModerationQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateModerationPendingCount(queryClient) {
  return queryClient.invalidateQueries({ queryKey: moderationQueryKeys.count() });
}
