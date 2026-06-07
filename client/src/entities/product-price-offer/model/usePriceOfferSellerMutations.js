import { useMutation, useQueryClient } from "@tanstack/react-query";

import { acceptPriceOffer } from "../api/acceptPriceOffer.js";
import { rejectPriceOffer } from "../api/rejectPriceOffer.js";
import {
  invalidateSellerPriceOffers,
  invalidateTopPriceOffers,
} from "../lib/priceOfferQueryCache.js";

/**
 * @param {string} productId
 */
export function usePriceOfferSellerMutations(productId) {
  const queryClient = useQueryClient();

  const invalidateOffers = () => {
    void invalidateSellerPriceOffers(queryClient, productId);
    void invalidateTopPriceOffers(queryClient, productId);
  };

  const acceptMutation = useMutation({
    mutationFn: (offerId) => acceptPriceOffer(productId, offerId),
    onSuccess: invalidateOffers,
  });

  const rejectMutation = useMutation({
    mutationFn: (offerId) => rejectPriceOffer(productId, offerId),
    onSuccess: invalidateOffers,
  });

  return {
    acceptMutation,
    rejectMutation,
  };
}
