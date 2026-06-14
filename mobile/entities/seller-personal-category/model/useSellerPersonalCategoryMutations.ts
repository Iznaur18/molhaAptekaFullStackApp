import { useMutation, useQueryClient } from "@tanstack/react-query";

import { loyaltyPointsQueryKeys, sellerPersonalCategoryQueryKeys } from "@/shared/api";

import {
  cancelSellerPersonalCategoryCampaign,
  submitSellerPersonalCategoryCampaign,
} from "../api/sellerPersonalCategoryMutationsApi";

export const useSellerPersonalCategoryMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
  };

  const submitMutation = useMutation({
    mutationFn: submitSellerPersonalCategoryCampaign,
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSellerPersonalCategoryCampaign,
    onSuccess: invalidate,
  });

  return { submitMutation, cancelMutation };
};
