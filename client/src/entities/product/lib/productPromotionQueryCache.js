import { productPromotionQueryKeys } from "../model/productPromotionQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductPromotionTariffs(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productPromotionQueryKeys.tariffs(),
  });
}
