import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
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
        queryClient.invalidateQueries({ queryKey: raffleQueryKeys.createAdvertising() }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
    },
  });
}
