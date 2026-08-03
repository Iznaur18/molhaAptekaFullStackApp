import { productQuestionQueryKeys } from "../model/productQuestionQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateProductQuestions(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: productQuestionQueryKeys.list(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateProductQuestionSummary(queryClient, productId) {
  return queryClient.invalidateQueries({
    queryKey: productQuestionQueryKeys.summary(productId),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} productId
 */
export function invalidateAllProductQuestionQueries(queryClient, productId) {
  return Promise.all([
    invalidateProductQuestions(queryClient, productId),
    invalidateProductQuestionSummary(queryClient, productId),
  ]);
}
