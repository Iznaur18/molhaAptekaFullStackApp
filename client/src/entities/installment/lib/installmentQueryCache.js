import { installmentQueryKeys } from "../model/installmentQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateInstallmentQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: installmentQueryKeys.all });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateInstallmentDisputesPending(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: installmentQueryKeys.disputesPending(),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateInstallmentUserActionCounts(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: installmentQueryKeys.buyerActionCount() }),
    queryClient.invalidateQueries({ queryKey: installmentQueryKeys.sellerActionCount() }),
  ]);
}

