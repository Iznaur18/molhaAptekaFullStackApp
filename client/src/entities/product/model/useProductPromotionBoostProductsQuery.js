import { useQuery } from "@tanstack/react-query";

import { fetchProductPromotionBoostProducts } from "../api/fetchProductPromotionBoostProducts.js";
import { productPromotionQueryKeys } from "./productPromotionQueryKeys.js";

/**
 * @param {{ enabled?: boolean; regionCode?: string }} [params]
 */
export function useProductPromotionBoostProductsQuery({
  enabled = true,
  regionCode = "",
} = {}) {
  return useQuery({
    queryKey: productPromotionQueryKeys.boostProducts(regionCode),
    enabled,
    queryFn: () =>
      fetchProductPromotionBoostProducts({ regionCode: regionCode || undefined }),
    staleTime: 60_000,
  });
}
