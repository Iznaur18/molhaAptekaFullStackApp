import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  claimMyPromoReturnStreak,
  fetchMyPromoReturnStreak,
} from "@/entities/promo-return-streak/api/promoReturnStreakApi";
import { promoReturnStreakQueryKeys } from "@/entities/promo-return-streak/model/promoReturnStreakQueryKeys";
import { raffleQueryKeys } from "@/shared/api";

export const useMyPromoReturnStreakQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: promoReturnStreakQueryKeys.all,
    enabled,
    queryFn: fetchMyPromoReturnStreak,
    staleTime: 30_000,
  });

export const useClaimPromoReturnStreakMutation = () => {
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
};

export const invalidatePromoReturnStreak = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    queryKey: promoReturnStreakQueryKeys.all,
  });
