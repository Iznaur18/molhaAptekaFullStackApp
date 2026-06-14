import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveProductModeration,
  fetchPendingModerationProducts,
  rejectProductModeration,
} from "@/entities/product/api/productModerationApi";
import { moderationQueryKeys } from "@/shared/api";

const MODERATION_QUEUE_LIMIT = 100;

export const usePendingModerationProductsQuery = (enabled = true) =>
  useQuery({
    queryKey: moderationQueryKeys.pending({ limit: MODERATION_QUEUE_LIMIT }),
    queryFn: () => fetchPendingModerationProducts(MODERATION_QUEUE_LIMIT),
    enabled,
  });

export const useProductModerationMutations = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all });
  };

  const approveMutation = useMutation({
    mutationFn: (productId: string) => approveProductModeration(productId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ productId, comment }: { productId: string; comment?: string }) =>
      rejectProductModeration(productId, comment ?? ""),
    onSuccess: invalidate,
  });

  return { approveMutation, rejectMutation };
};
