import { useQuery } from "@tanstack/react-query";

import { productPromotionQueryKeys } from "@/entities/product/model/productPromotionQueryKeys";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchProductPromotionTariffs } from "../api/fetchProductPromotionTariffs";

const PROMOTION_TARIFFS_STALE_TIME_MS = 5 * 60_000;

export const useProductPromotionTariffsQuery = (enabled = true) => {
  return useQuery({
    queryKey: productPromotionQueryKeys.tariffs(),
    queryFn: fetchProductPromotionTariffs,
    enabled,
    staleTime: Math.min(DEFAULT_QUERY_STALE_TIME_MS, PROMOTION_TARIFFS_STALE_TIME_MS),
  });
};
