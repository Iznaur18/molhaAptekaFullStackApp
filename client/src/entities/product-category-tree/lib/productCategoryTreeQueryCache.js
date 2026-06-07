import { productCategoryTreeQueryKeys } from "../model/productCategoryTreeQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductCategoryRoots(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productCategoryTreeQueryKeys.roots(),
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {string} [categoryId]
 */
export function invalidateProductCategoryBreadcrumb(queryClient, categoryId) {
  if (categoryId) {
    return queryClient.invalidateQueries({
      queryKey: productCategoryTreeQueryKeys.breadcrumb(categoryId),
    });
  }
  return queryClient.invalidateQueries({
    queryKey: [...productCategoryTreeQueryKeys.all, "breadcrumb"],
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateAllProductCategoryTreeQueries(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: productCategoryTreeQueryKeys.all,
  });
}
