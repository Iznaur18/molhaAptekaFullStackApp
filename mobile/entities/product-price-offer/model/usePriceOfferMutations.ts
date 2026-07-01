import { useMutation, useQueryClient } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import {
  cancelMyPriceOffer,
  patchMyPriceOffer,
  submitPriceOffer,
} from "../api/priceOfferApi";

export const usePriceOfferMutations = (productId: string) => {
  const queryClient = useQueryClient();

  const invalidateOffers = () => {
    void queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.my(productId) });
    void queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.top(productId) });
    void queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.myBids() });
  };

  const submitMutation = useMutation({
    mutationFn: (offerPrice: number) => submitPriceOffer(productId, offerPrice),
    onSuccess: invalidateOffers,
  });

  const patchMutation = useMutation({
    mutationFn: (offerPrice: number) => patchMyPriceOffer(productId, offerPrice),
    onSuccess: invalidateOffers,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelMyPriceOffer(productId),
    onSuccess: invalidateOffers,
  });

  return {
    submitMutation,
    patchMutation,
    cancelMutation,
  };
};
