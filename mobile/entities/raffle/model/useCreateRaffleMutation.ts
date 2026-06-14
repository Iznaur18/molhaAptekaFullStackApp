import { useMutation, useQueryClient } from "@tanstack/react-query";

import { raffleQueryKeys } from "@/shared/api";

import { createRaffle } from "../api/createRaffle";

export const useCreateRaffleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRaffle,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: raffleQueryKeys.all });
    },
  });
};
