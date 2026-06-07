import { useQuery } from "@tanstack/react-query";

import { fetchPendingInstallmentModeration } from "../api/installmentApi.js";
import { installmentQueryKeys } from "./installmentQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function usePendingInstallmentModerationQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: installmentQueryKeys.moderationPending(),
    enabled,
    queryFn: fetchPendingInstallmentModeration,
  });
}
