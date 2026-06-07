import { useQuery } from "@tanstack/react-query";

import { fetchPendingInstallmentDisputes } from "../api/installmentApi.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function usePendingInstallmentDisputesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: installmentQueryKeys.disputesPending(),
    enabled,
    queryFn: fetchPendingInstallmentDisputes,
  });
}
