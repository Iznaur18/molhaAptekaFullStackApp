import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoryRoots } from "../api/fetchProductCategoryRoots.js";
import { productCategoryTreeQueryKeys } from "./productCategoryTreeQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductCategoryRootsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productCategoryTreeQueryKeys.roots(),
    enabled,
    queryFn: fetchProductCategoryRoots,
    select: (data) => data.categories,
  });
}
