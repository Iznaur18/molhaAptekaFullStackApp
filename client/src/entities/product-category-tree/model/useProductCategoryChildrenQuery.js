import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoryChildren } from "../api/fetchProductCategoryChildren.js";
import { productCategoryTreeQueryKeys } from "./productCategoryTreeQueryKeys.js";

/**
 * @param {{ parentId: string; enabled?: boolean }} params
 */
export function useProductCategoryChildrenQuery({ parentId, enabled = true }) {
  return useQuery({
    queryKey: productCategoryTreeQueryKeys.children(parentId),
    enabled: enabled && Boolean(parentId),
    queryFn: () => fetchProductCategoryChildren(parentId),
    select: (data) => data.categories,
  });
}
