import { productPromotionQueryKeys } from "../model/productPromotionQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function invalidateStaffProductPromotionsQueue(queryClient) {
  await queryClient.invalidateQueries({
    queryKey: productPromotionQueryKeys.staffPending(),
  });
}
