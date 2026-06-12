import { useQuery } from "@tanstack/react-query";

import { categoryTreeQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchProductCategoryChildren } from "../api/fetchProductCategoryChildren";

export const useProductCategoryChildrenQuery = (categoryId: string | null) => {
  return useQuery({
    queryKey: categoryTreeQueryKeys.children(categoryId ?? ""),
    queryFn: () => fetchProductCategoryChildren(categoryId!),
    enabled: Boolean(categoryId),
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  });
};
