import { useMutation } from "@tanstack/react-query";

import { requestProductPromotion } from "../api/requestProductPromotion";

type RequestProductPromotionVariables = {
  productId: string;
  tier: number;
  tariffCode: string;
};

export const useRequestProductPromotionMutation = () => {
  return useMutation({
    mutationFn: ({ productId, tier, tariffCode }: RequestProductPromotionVariables) =>
      requestProductPromotion(productId, { tier, tariffCode }),
  });
};
