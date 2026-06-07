import { useQuery } from "@tanstack/react-query";

import { fetchPendingUserStoryReports } from "../api/fetchPendingUserStoryReports.js";
import { userStoryReportQueryKeys } from "./userStoryReportQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function usePendingUserStoryReportsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: userStoryReportQueryKeys.pending(),
    enabled,
    queryFn: fetchPendingUserStoryReports,
  });
}
