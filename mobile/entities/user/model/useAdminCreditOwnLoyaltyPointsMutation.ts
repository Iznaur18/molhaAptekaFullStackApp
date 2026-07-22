import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authMeQueryKeys, loyaltyPointsQueryKeys } from "@/shared/api";

import { adminCreditOwnLoyaltyPoints } from "../api/adminCreditOwnLoyaltyPoints";

export const useAdminCreditOwnLoyaltyPointsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminCreditOwnLoyaltyPoints,
    onSuccess: (result) => {
      queryClient.setQueryData(loyaltyPointsQueryKeys.status(), {
        loyaltyPointsBalance: result.loyaltyPointsBalance,
      });
      void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: authMeQueryKeys.all });
    },
  });
};
