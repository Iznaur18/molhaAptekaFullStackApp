import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveProductPromotion } from "../api/approveProductPromotion.js";
import { rejectProductPromotion } from "../api/rejectProductPromotion.js";
import { invalidateStaffProductPromotionsQueue } from "../lib/productPromotionQueryCache.js";

export function useProductPromotionStaffMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => void invalidateStaffProductPromotionsQueue(queryClient);

  const approveMutation = useMutation({
    mutationFn: (promotionId) => approveProductPromotion(promotionId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (promotionId) => rejectProductPromotion(promotionId),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
}
