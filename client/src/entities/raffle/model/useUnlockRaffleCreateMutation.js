import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidatePromoReturnStreak } from "../../promo-return-streak/model/usePromoReturnStreak.js";
import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
import { invalidateLoyaltyPointsBalances } from "../../../entities/user/lib/loyaltyPointsQueryCache.js";
import { unlockRaffleCreate } from "../api/unlockRaffleCreate.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

export function useUnlockRaffleCreateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockRaffleCreate,
    onSuccess: async (result) => {
      if (result.loyaltyPointsBalance != null) {
        queryClient.setQueryData(loyaltyPointsQueryKeys.all, {
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: raffleQueryKeys.createAdvertising(),
        }),
        invalidateLoyaltyPointsBalances(queryClient),
        invalidatePromoReturnStreak(queryClient),
      ]);
    },
  });
}
