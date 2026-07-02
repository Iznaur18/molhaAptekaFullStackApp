import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setProductRaffleParticipation } from "@/entities/raffle/api/setProductRaffleParticipation";
import { catalogQueryKeys, myProductsQueryKeys, raffleQueryKeys } from "@/shared/api";

export const useSetProductRaffleParticipationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, enabled }: { productId: string; enabled: boolean }) =>
      setProductRaffleParticipation(productId, enabled),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: raffleQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: myProductsQueryKeys.all });
    },
  });
};
