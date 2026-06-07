import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelMyPriceOffer } from "../api/cancelMyPriceOffer.js";
import { patchMyPriceOffer } from "../api/patchMyPriceOffer.js";
import { submitPriceOffer } from "../api/submitPriceOffer.js";
import {
  invalidateMyPriceOffer,
  invalidateTopPriceOffers,
} from "../lib/priceOfferQueryCache.js";

/**
 * @param {string} productId
 */
export function usePriceOfferMutations(productId) {
  const queryClient = useQueryClient();

  const invalidateOffers = () => {
    void invalidateMyPriceOffer(queryClient, productId);
    void invalidateTopPriceOffers(queryClient, productId);
  };

  const submitMutation = useMutation({
    mutationFn: (price) => submitPriceOffer(productId, price),
    onSuccess: invalidateOffers,
  });

  const patchMutation = useMutation({
    mutationFn: (price) => patchMyPriceOffer(productId, price),
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
}
