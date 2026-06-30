import { useQuery } from "@tanstack/react-query";

import { categoryTreeQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchProductCategoryBreadcrumb } from "../api/fetchProductCategoryBreadcrumb";

export const useProductCategoryBreadcrumbQuery = ({
  categoryId = null,
  enabled = true,
}: {
  categoryId?: string | null;
  enabled?: boolean;
} = {}) => {
  const normalizedCategoryId = categoryId?.trim() ?? "";

  return useQuery({
    queryKey: categoryTreeQueryKeys.breadcrumb(normalizedCategoryId),
    queryFn: () => fetchProductCategoryBreadcrumb(normalizedCategoryId),
    enabled: enabled && normalizedCategoryId.length > 0,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
    select: (data) => data.breadcrumb,
  });
};
