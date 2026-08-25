import { useQuery } from "@tanstack/react-query";

import { fetchAdminAnalyticsOverview } from "../api/adminAnalyticsApi.js";
import { adminAnalyticsQueryKeys } from "./adminAnalyticsQueryKeys.js";

/**
 * @param {string} period
 * @param {{ enabled?: boolean }} [options]
 */
export function useAdminAnalyticsOverviewQuery(period, { enabled = true } = {}) {
  return useQuery({
    queryKey: adminAnalyticsQueryKeys.overview(period),
    queryFn: () => fetchAdminAnalyticsOverview({ period }),
    enabled,
  });
}
