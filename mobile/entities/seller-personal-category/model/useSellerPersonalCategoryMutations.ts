import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invalidatePromoReturnStreak } from "@/entities/promo-return-streak/model/usePromoReturnStreak";
import { loyaltyPointsQueryKeys, sellerPersonalCategoryQueryKeys } from "@/shared/api";

import {
  cancelSellerPersonalCategoryCampaign,
  submitSellerPersonalCategoryCampaign,
} from "../api/sellerPersonalCategoryMutationsApi";

export const useSellerPersonalCategoryMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAfterSubmit = () => {
    void queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
    void invalidatePromoReturnStreak(queryClient);
  };

  const invalidateAfterCancel = () => {
    void queryClient.invalidateQueries({
      queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
  };

  const submitMutation = useMutation({
    mutationFn: submitSellerPersonalCategoryCampaign,
    onSuccess: invalidateAfterSubmit,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSellerPersonalCategoryCampaign,
    onSuccess: invalidateAfterCancel,
  });

  return { submitMutation, cancelMutation };
};
