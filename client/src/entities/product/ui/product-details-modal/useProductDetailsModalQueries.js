import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useTopPriceOffersQuery } from "../../../product-price-offer/model/useTopPriceOffersQuery.js";
import { invalidateTopPriceOffers } from "../../../product-price-offer/lib/priceOfferQueryCache.js";
import { useProductInstallmentProgramQuery } from "../../../installment/model/useProductInstallmentProgramQuery.js";
import { resolveAuctionUiState } from "../../lib/resolveAuctionUiState.js";

/**
 * @param {{
 *   isOpen: boolean;
 *   product: import("../../model/types.js").ProductFromApi | null;
 * }} params
 */
export function useProductDetailsModalQueries({ isOpen, product }) {
  const queryClient = useQueryClient();
  const productId = product?._id != null ? String(product._id) : "";
  const auctionUi = useMemo(() => resolveAuctionUiState(product), [product]);

  const topOffersQuery = useTopPriceOffersQuery({
    productId,
    enabled: isOpen && Boolean(productId) && auctionUi.auctionActive,
  });
  const installmentProgramQuery = useProductInstallmentProgramQuery({
    productId,
    enabled: isOpen && Boolean(productId),
  });

  const refreshTopOffers = useCallback(() => {
    void invalidateTopPriceOffers(queryClient, productId);
  }, [productId, queryClient]);

  const refreshInstallmentProgram = useCallback(() => {
    void installmentProgramQuery.refetch();
  }, [installmentProgramQuery]);

  return {
    topOffers: topOffersQuery.data ?? [],
    installmentProgram: installmentProgramQuery.data ?? null,
    isInstallmentProgramLoading: installmentProgramQuery.isLoading,
    refreshTopOffers,
    refreshInstallmentProgram,
  };
}
