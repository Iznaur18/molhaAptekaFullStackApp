import { productCategoryDisplayQueryKeys } from "../model/productCategoryDisplayQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductCategoryDisplays(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productCategoryDisplayQueryKeys.categories(),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductCatalogFeedTileDisplays(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productCategoryDisplayQueryKeys.feedTiles(),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateAllProductCategoryDisplayQueries(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productCategoryDisplayQueryKeys.all,
  });
}
