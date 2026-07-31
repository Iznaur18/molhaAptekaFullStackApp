import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { adminCreditOwnLoyaltyPoints } from "../api/adminCreditOwnLoyaltyPoints.js";
import { invalidateLoyaltyPointsStatus } from "../lib/loyaltyPointsQueryCache.js";
import { loyaltyPointsQueryKeys } from "./loyaltyPointsQueryKeys.js";

/**
 * @param {{
 *   onBalanceChange?: (balance: number) => void;
 * }} [options]
 */
export function useAdminCreditOwnLoyaltyPointsMutation({
  onBalanceChange,
} = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount }) =>
      adminCreditOwnLoyaltyPoints({
        amount,
        idempotencyKey: createClientIdempotencyKey(),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(loyaltyPointsQueryKeys.all, {
        loyaltyPointsBalance: result.loyaltyPointsBalance,
      });
      void invalidateLoyaltyPointsStatus(queryClient);
      onBalanceChange?.(result.loyaltyPointsBalance);
    },
  });
}
