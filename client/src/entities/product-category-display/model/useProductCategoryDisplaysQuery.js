import { useQuery } from "@tanstack/react-query";

import { fetchProductCategoryDisplays } from "../api/fetchProductCategoryDisplays.js";
import { productCategoryDisplayQueryKeys } from "./productCategoryDisplayQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductCategoryDisplaysQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productCategoryDisplayQueryKeys.categories(),
    enabled,
    queryFn: fetchProductCategoryDisplays,
    select: (data) => data.displays,
  });
}
