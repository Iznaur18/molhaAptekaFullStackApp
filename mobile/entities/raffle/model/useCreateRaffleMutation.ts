import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys, raffleQueryKeys } from "@/shared/api";

import { createRaffle } from "../api/createRaffle";

export const useCreateRaffleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRaffle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: raffleQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: raffleQueryKeys.createAdvertising() });
      void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
    },
  });
};