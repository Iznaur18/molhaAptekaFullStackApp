import { useMutation, useQueryClient } from "@tanstack/react-query";

import { submitProductReview } from "../api/productReviewApi";
import { productReviewQueryKeys } from "./productReviewQueryKeys";

export const useSubmitProductReviewMutation = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { rating: number; text?: string }) =>
      submitProductReview(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productReviewQueryKeys.summary(productId),
      });
      void queryClient.invalidateQueries({
        queryKey: productReviewQueryKeys.all,
      });
    },
  });
};
