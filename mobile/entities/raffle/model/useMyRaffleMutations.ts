import { useMutation, useQueryClient } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { deleteMyRaffle } from "../api/deleteMyRaffle";
import { pauseMyRaffle } from "../api/pauseMyRaffle";

export const useMyRaffleMutations = () => {
  const queryClient = useQueryClient();

  const invalidateMyRaffle = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.my() }),
      queryClient.invalidateQueries({ queryKey: raffleQueryKeys.featured() }),
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

  return { pauseMyMutation, deleteMyMutation };
};
