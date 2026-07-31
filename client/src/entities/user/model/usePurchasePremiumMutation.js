import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { purchasePremium } from "../api/purchasePremium.js";
import { invalidateLoyaltyPointsStatus } from "../lib/loyaltyPointsQueryCache.js";
import { invalidatePremiumStatus } from "../lib/premiumQueryCache.js";
import { premiumQueryKeys } from "./premiumQueryKeys.js";

export function usePurchasePremiumMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      purchasePremium({ idempotencyKey: createClientIdempotencyKey() }),
    onSuccess: (result) => {
      queryClient.setQueryData(premiumQueryKeys.all, (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          isActive: result.isActive,
          premiumExpiresAt: result.premiumExpiresAt ?? old.premiumExpiresAt ?? null,
          canPurchase: false,
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        };
      });
      void invalidatePremiumStatus(queryClient);
      void invalidateLoyaltyPointsStatus(queryClient);
    },
  });
}
