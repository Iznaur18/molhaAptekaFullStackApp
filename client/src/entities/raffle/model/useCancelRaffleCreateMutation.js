import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys } from "../../../entities/user/model/loyaltyPointsQueryKeys.js";
import { cancelRaffleCreate } from "../api/cancelRaffleCreate.js";
import { raffleQueryKeys } from "./raffleQueryKeys.js";

export function useCancelRaffleCreateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRaffleCreate,
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
