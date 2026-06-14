import { useQuery } from "@tanstack/react-query";

import { fetchPendingProductPromotions } from "../api/fetchPendingProductPromotions.js";
import { productPromotionQueryKeys } from "./productPromotionQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function usePendingProductPromotionsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productPromotionQueryKeys.staffPending(),
    queryFn: fetchPendingProductPromotions,
    enabled,
  });
}
