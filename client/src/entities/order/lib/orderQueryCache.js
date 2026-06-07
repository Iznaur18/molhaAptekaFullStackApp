import { orderQueryKeys } from "../model/orderQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateOrderQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: orderQueryKeys.all });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateMyOrders(queryClient) {
  return queryClient.invalidateQueries({ queryKey: orderQueryKeys.my() });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateMySalesOrders(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: [...orderQueryKeys.all, "sales"],
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateOrderActionCounts(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: orderQueryKeys.myActionCount() }),
    queryClient.invalidateQueries({ queryKey: orderQueryKeys.salesActionCount() }),
  ]);
}
