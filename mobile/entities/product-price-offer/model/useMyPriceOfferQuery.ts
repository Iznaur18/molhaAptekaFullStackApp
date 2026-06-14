import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import { fetchMyPriceOffer } from "../api/priceOfferApi";

export const useMyPriceOfferQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.my(productId),
    queryFn: () => fetchMyPriceOffer(productId),
    enabled: Boolean(productId) && enabled,
  });
