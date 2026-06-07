import { priceOfferQueryKeys } from "../model/priceOfferQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidatePriceOfferQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.all });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateIncomingPriceOffers(queryClient) {
  return queryClient.invalidateQueries({ queryKey: priceOfferQueryKeys.incoming() });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateSellerPriceOffers(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: priceOfferQueryKeys.seller(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateMyPriceOffer(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: priceOfferQueryKeys.myForProduct(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateTopPriceOffers(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: priceOfferQueryKeys.topForProduct(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateSellerPriceOfferArchive(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: priceOfferQueryKeys.sellerArchive(productId),
  });
}
