import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMyProductReview } from "../api/deleteMyProductReview.js";
import { patchMyProductReview } from "../api/patchMyProductReview.js";
import { submitProductReview } from "../api/submitProductReview.js";
import { invalidateAllProductReviewQueries } from "../lib/productReviewQueryCache.js";

/**
 * @param {string} productId
 */
export function useProductReviewMutations(productId) {
  const queryClient = useQueryClient();

  const invalidateReviews = () =>
    invalidateAllProductReviewQueries(queryClient, productId);

  const submitMutation = useMutation({
    mutationFn: (payload) => submitProductReview(productId, payload),
    onSuccess: () => invalidateReviews(),
  });

  const patchMutation = useMutation({
    mutationFn: (payload) => patchMyProductReview(productId, payload),
    onSuccess: () => invalidateReviews(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMyProductReview(productId),
    onSuccess: () => invalidateReviews(),
  });

  return {
    submitMutation,
    patchMutation,
    deleteMutation,
  };
}
