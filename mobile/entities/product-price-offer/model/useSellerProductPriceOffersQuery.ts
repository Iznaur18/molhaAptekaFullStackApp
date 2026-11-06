import { useQuery } from "@tanstack/react-query";

import { priceOfferQueryKeys } from "@/shared/api";

import {
  fetchSellerProductPriceOfferArchive,
  fetchSellerProductPriceOffers,
} from "../api/sellerProductPriceOffersApi";

/** Ставки по своему товару — для вкладки «Аукцион» продавца. */
export const useSellerProductPriceOffersQuery = (productId: string, enabled = true) =>
  useQuery({
    queryKey: priceOfferQueryKeys.seller(productId),
    queryFn: () => fetchSellerProductPriceOffers(productId),
    enabled: Boolean(productId) && enabled,
  });

/** Архив ставок прошедших аукционов по своему товару. */
export const useSellerProductPriceOfferArchiveQuery = (
  productId: string,
  enabled = true,
) =>
  useQuery({
    queryKey: priceOfferQueryKeys.sellerArchive(productId),
    queryFn: () => fetchSellerProductPriceOfferArchive(productId),
    enabled: Boolean(productId) && enabled,
  });
