import { useQuery } from "@tanstack/react-query";

import { fetchPendingModerationProducts } from "../api/fetchPendingModerationProducts.js";
import { moderationQueryKeys } from "./moderationQueryKeys.js";

/**
 * @param {{ limit?: number; enabled?: boolean }} [params]
 */
export function usePendingModerationProductsQuery({
  limit = 100,
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: moderationQueryKeys.pending({ limit }),
    enabled,
    queryFn: () => fetchPendingModerationProducts({ limit }),
  });
}
