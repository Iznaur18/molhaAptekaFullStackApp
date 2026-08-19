import { useQuery } from "@tanstack/react-query";

import { fetchProductCategorySearch } from "../api/fetchProductCategorySearch.js";
import { productCategoryTreeQueryKeys } from "./productCategoryTreeQueryKeys.js";

/**
 * @param {{ query: string; enabled?: boolean }} params
 */
export function useProductCategorySearchQuery({ query, enabled = true }) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: productCategoryTreeQueryKeys.search(trimmed),
    queryFn: () => fetchProductCategorySearch({ query: trimmed }),
    enabled: enabled && trimmed.length >= 2,
  });
}
