import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveProductPromotion,
  fetchPendingProductPromotions,
  rejectProductPromotion,
} from "@/entities/product-promotion/api/productPromotionStaffApi";
import { productPromotionQueryKeys, staffBadgeQueryKeys } from "@/shared/api";

export const usePendingProductPromotionsQuery = (enabled = true) =>
  useQuery({
    queryKey: productPromotionQueryKeys.staffPending(),
    queryFn: fetchPendingProductPromotions,
    enabled,
  });

export const useProductPromotionStaffMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: productPromotionQueryKeys.all });
    void queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.all });
  };

  const approveMutation = useMutation({
    mutationFn: (promotionId: string) => approveProductPromotion(promotionId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (promotionId: string) => rejectProductPromotion(promotionId),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
};
