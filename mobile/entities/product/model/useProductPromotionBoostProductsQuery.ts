import { useQuery } from "@tanstack/react-query";

import { fetchProductPromotionBoostProducts } from "@/entities/product/api/fetchProductPromotionBoostProducts";
import { productPromotionQueryKeys } from "@/entities/product/model/productPromotionQueryKeys";

const BOOST_PRODUCTS_STALE_TIME_MS = 60_000;

export const useProductPromotionBoostProductsQuery = ({
  enabled = true,
  regionCode = "",
}: {
  enabled?: boolean;
  regionCode?: string;
} = {}) =>
  useQuery({
    queryKey: productPromotionQueryKeys.boostProducts(regionCode),
    enabled,
    queryFn: () =>
      fetchProductPromotionBoostProducts({
        regionCode: regionCode || undefined,
      }),
    staleTime: BOOST_PRODUCTS_STALE_TIME_MS,
  });
