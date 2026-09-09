import { useMutation } from "@tanstack/react-query";

import { createClientIdempotencyKey } from "../../../shared/lib/createClientIdempotencyKey.js";
import { requestProductPromotion } from "../api/requestProductPromotion.js";

export function useRequestProductPromotionMutation() {
  return useMutation({
    mutationFn: ({ productId, tier, tariffCode, paymentMethod = "sbp" }) =>
      requestProductPromotion(productId, {
        tier,
        tariffCode,
        paymentMethod,
        idempotencyKey: createClientIdempotencyKey(),
      }),
  });
}
