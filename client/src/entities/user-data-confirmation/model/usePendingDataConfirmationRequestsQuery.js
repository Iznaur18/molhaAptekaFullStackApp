import { useQuery } from "@tanstack/react-query";

import { fetchPendingDataConfirmationRequests } from "../api/fetchPendingDataConfirmationRequests.js";
import { pendingDataConfirmationQueryKeys } from "./pendingDataConfirmationQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function usePendingDataConfirmationRequestsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: pendingDataConfirmationQueryKeys.all,
    enabled,
    queryFn: fetchPendingDataConfirmationRequests,
  });
}
