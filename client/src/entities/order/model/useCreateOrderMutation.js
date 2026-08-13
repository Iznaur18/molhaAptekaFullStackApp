import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { readPersistedAffiliateCode } from "../../../shared/lib/affiliateCodeStorage.js";
import { productPromoCodeQueryKeys } from "../../product-promo-code/model/productPromoCodeQueryKeys.js";
import { invalidateLoyaltyPointsStatus } from "../../user/lib/loyaltyPointsQueryCache.js";
import { createOrder } from "../api/createOrder.js";
import { invalidateOrderQueries } from "../lib/orderQueryCache.js";

export function useCreateOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => {
      const affiliateCode =
        payload.affiliateCode ?? readPersistedAffiliateCode() ?? "";
      return createOrder({
        ...payload,
        ...(affiliateCode ? { affiliateCode } : {}),
        idempotencyKey: payload.idempotencyKey ?? createClientIdempotencyKey(),
      });
    },
    onSuccess: () => {
      void invalidateOrderQueries(queryClient);
      void invalidateLoyaltyPointsStatus(queryClient);
      void queryClient.invalidateQueries({
        queryKey: productPromoCodeQueryKeys.appliedMine(),
      });
      queryClient.removeQueries({
        queryKey: productPromoCodeQueryKeys.appliedMine(),
      });
    },
  });
}
