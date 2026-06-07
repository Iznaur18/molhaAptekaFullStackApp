import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchProductPromotionTariffs } from "../api/fetchProductPromotionTariffs.js";
import { productPromotionQueryKeys } from "./productPromotionQueryKeys.js";

const PROMOTION_TARIFFS_STALE_TIME_MS = 5 * 60_000;

export function useEnsureProductPromotionTariffs() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.ensureQueryData({
        queryKey: productPromotionQueryKeys.tariffs(),
        queryFn: fetchProductPromotionTariffs,
        staleTime: PROMOTION_TARIFFS_STALE_TIME_MS,
      }),
    [queryClient],
  );
}
