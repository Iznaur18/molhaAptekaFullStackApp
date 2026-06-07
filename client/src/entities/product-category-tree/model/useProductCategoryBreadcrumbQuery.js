import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoryBreadcrumb } from "../api/fetchProductCategoryBreadcrumb.js";
import { productCategoryTreeQueryKeys } from "./productCategoryTreeQueryKeys.js";

/**
 * @param {{ categoryId?: string | null; enabled?: boolean }} [params]
 */
export function useProductCategoryBreadcrumbQuery({
  categoryId = null,
  enabled = true,
} = {}) {
  const normalizedCategoryId = categoryId?.trim() ?? "";

  return useQuery({
    queryKey: productCategoryTreeQueryKeys.breadcrumb(normalizedCategoryId),
    enabled: enabled && normalizedCategoryId.length > 0,
    queryFn: () => fetchProductCategoryBreadcrumb(normalizedCategoryId),
    select: (data) => data.breadcrumb,
  });
}
