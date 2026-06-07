import { productReviewQueryKeys } from "../model/productReviewQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateProductReviews(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: productReviewQueryKeys.list(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateProductReviewSummary(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: productReviewQueryKeys.summary(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateAllProductReviewQueries(queryClient, productId) {
  return Promise.all([
    invalidateProductReviews(queryClient, productId),
    invalidateProductReviewSummary(queryClient, productId),
  ]);
}
