import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys, raffleQueryKeys } from "@/shared/api";

import { unlockRaffleCreate } from "../api/unlockRaffleCreate";

export const useUnlockRaffleCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unlockRaffleCreate,
    onSuccess: async (result) => {
      if (result.loyaltyPointsBalance != null) {
        queryClient.setQueryData(loyaltyPointsQueryKeys.status(), (current) => ({
          ...(typeof current === "object" && current != null ? current : {}),
          loyaltyPointsBalance: result.loyaltyPointsBalance,
        }));
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: raffleQueryKeys.createAdvertising() }),
        queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
      ]);
    },
  });
};
