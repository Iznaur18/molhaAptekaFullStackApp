import { useQuery } from "@tanstack/react-query";

import { categoryDisplayQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import { fetchProductCategoryDisplays } from "../api/fetchProductCategoryDisplays";

export const useProductCategoryDisplaysQuery = () => {
  return useQuery({
    queryKey: categoryDisplayQueryKeys.all,
    queryFn: fetchProductCategoryDisplays,
    staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  });
};
