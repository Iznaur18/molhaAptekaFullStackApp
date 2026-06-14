import { useMutation, useQueryClient } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { acceptPriceOffer, rejectPriceOffer } from "../api/incomingPriceOffersApi";

export const usePriceOfferSellerMutations = (productId: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.incoming() });
    void queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.top(productId) });
  };

  const acceptMutation = useMutation({
    mutationFn: (offerId: string) => acceptPriceOffer(productId, offerId),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: (offerId: string) => rejectPriceOffer(productId, offerId),
    onSuccess: invalidate,
  });

  return { acceptMutation, rejectMutation };
};
