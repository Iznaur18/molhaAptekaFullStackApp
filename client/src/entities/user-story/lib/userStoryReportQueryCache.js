import { userStoryReportQueryKeys } from "../model/userStoryReportQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateUserStoryReportQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: userStoryReportQueryKeys.all });
}
