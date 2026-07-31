import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, loyaltyPointsQueryKeys, premiumQueryKeys } from "@/shared/api";
import { createClientIdempotencyKey } from "@/shared/lib/createClientIdempotencyKey";

import { purchasePremium } from "../api/purchasePremium";

export const usePurchasePremiumMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      purchasePremium({ idempotencyKey: createClientIdempotencyKey() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: premiumQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
    },
  });
};
