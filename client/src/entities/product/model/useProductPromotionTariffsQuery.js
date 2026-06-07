import { useQuery } from "@tanstack/react-query";

import { fetchProductPromotionTariffs } from "../api/fetchProductPromotionTariffs.js";
import { productPromotionQueryKeys } from "./productPromotionQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductPromotionTariffsQuery({ enabled = false } = {}) {
  return useQuery({
    queryKey: productPromotionQueryKeys.tariffs(),
    enabled,
    queryFn: fetchProductPromotionTariffs,
    staleTime: 5 * 60_000,
  });
}
