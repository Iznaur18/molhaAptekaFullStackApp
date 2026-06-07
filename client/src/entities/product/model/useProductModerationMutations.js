import { useMutation, useQueryClient } from "@tanstack/react-query";

import { approveProductModeration } from "../api/approveProductModeration.js";
import { rejectProductModeration } from "../api/rejectProductModeration.js";
import { invalidateModerationPendingCount } from "../lib/moderationQueryCache.js";

export function useProductModerationMutations() {
  const queryClient = useQueryClient();

  const invalidateModeration = () => {
    void invalidateModerationPendingCount(queryClient);
  };

  const approveMutation = useMutation({
    mutationFn: (productId) => approveProductModeration(productId),
    onSuccess: invalidateModeration,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ productId, comment }) => rejectProductModeration(productId, comment),
    onSuccess: invalidateModeration,
  });

  return {
    approveMutation,
    rejectMutation,
  };
}
