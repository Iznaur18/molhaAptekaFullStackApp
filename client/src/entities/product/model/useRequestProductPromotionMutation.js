import { useMutation } from "@tanstack/react-query";

import { requestProductPromotion } from "../api/requestProductPromotion.js";

export function useRequestProductPromotionMutation() {
  return useMutation({
    mutationFn: ({ productId, tier, tariffCode }) =>
      requestProductPromotion(productId, { tier, tariffCode }),
  });
}
