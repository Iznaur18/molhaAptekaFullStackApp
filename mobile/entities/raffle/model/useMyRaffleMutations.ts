import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys, raffleQueryKeys } from "@/shared/api";

import { deleteMyRaffle } from "../api/deleteMyRaffle";
import { patchMyRaffle } from "../api/patchMyRaffle";
import { pauseMyRaffle } from "../api/pauseMyRaffle";
import type { CreateRaffleBody } from "../api/createRaffle";

export const useMyRaffleMutations = () => {
  const queryClient = useQueryClient();

  const invalidateMyRaffle = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.my() }),
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.featured() }),
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.createAdvertising() }),
      queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all }),
    ]);
  };

  const pauseMyMutation = useMutation({
    mutationFn: pauseMyRaffle,
    onSuccess: () => void invalidateMyRaffle(),
  });

  const deleteMyMutation = useMutation({
    mutationFn: deleteMyRaffle,
    onSuccess: () => void invalidateMyRaffle(),
  });

  const patchMyMutation = useMutation({
    mutationFn: ({ raffleId, body }: { raffleId: string; body: Partial<CreateRaffleBody> }) =>
      patchMyRaffle(raffleId, body),
    onSuccess: () => void invalidateMyRaffle(),
  });

  return { pauseMyMutation, deleteMyMutation, patchMyMutation };
};
