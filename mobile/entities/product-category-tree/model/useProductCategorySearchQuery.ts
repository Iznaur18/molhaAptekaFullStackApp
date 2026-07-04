import { useQuery } from "@tanstack/react-query";

import { categoryTreeQueryKeys } from "@/shared/api";

import { fetchProductCategorySearch } from "../api/fetchProductCategorySearch";

export const CATEGORY_SEARCH_MIN_QUERY_LENGTH = 2;

export const useProductCategorySearchQuery = (query: string) => {
  const normalized = query.trim();
  return useQuery({
    queryKey: categoryTreeQueryKeys.search(normalized),
    queryFn: () => fetchProductCategorySearch(normalized),
    enabled: normalized.length >= CATEGORY_SEARCH_MIN_QUERY_LENGTH,
    staleTime: 60_000,
  });
};
