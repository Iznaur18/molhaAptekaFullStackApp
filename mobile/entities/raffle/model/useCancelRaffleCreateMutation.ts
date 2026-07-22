import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys, raffleQueryKeys } from "@/shared/api";

import { cancelRaffleCreate } from "../api/cancelRaffleCreate";

export const useCancelRaffleCreateMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRaffleCreate,
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
