import { myProductsTotalQueryKeys } from "../model/myProductsTotalQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateMyProductsTotal(queryClient) {
  return queryClient.invalidateQueries({ queryKey: myProductsTotalQueryKeys.all });
}
