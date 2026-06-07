import { productReportQueryKeys } from "../model/productReportQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductReportQueries(queryClient) {
  return queryClient.invalidateQueries({ queryKey: productReportQueryKeys.all });
}
