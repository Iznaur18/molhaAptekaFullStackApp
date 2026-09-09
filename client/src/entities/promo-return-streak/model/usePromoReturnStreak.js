import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { raffleQueryKeys } from "../../raffle/model/raffleQueryKeys.js";
import {
  claimMyPromoReturnStreak,
  fetchMyPromoReturnStreak,
} from "../api/promoReturnStreakApi.js";
import { promoReturnStreakQueryKeys } from "./promoReturnStreakQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyPromoReturnStreakQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: promoReturnStreakQueryKeys.all,
    enabled,
    queryFn: fetchMyPromoReturnStreak,
    staleTime: 30_000,
  });
}

export function useClaimPromoReturnStreakMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimMyPromoReturnStreak,
    onSuccess: (result) => {
      queryClient.setQueryData(promoReturnStreakQueryKeys.all, result.streak);
      void queryClient.invalidateQueries({
        queryKey: raffleQueryKeys.createAdvertising(),
      });
    },
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidatePromoReturnStreak(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: promoReturnStreakQueryKeys.all,
  });
}
