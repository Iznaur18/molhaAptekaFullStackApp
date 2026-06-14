import { useQuery } from "@tanstack/react-query";

import { categoryTreeQueryKeys } from "@/shared/api";

import { fetchProductCategoryRoots } from "../api/fetchProductCategoryRoots";

export const useProductCategoryRootsQuery = (enabled = true) => {
  return useQuery({
    queryKey: [...categoryTreeQueryKeys.all, "roots"] as const,
    queryFn: fetchProductCategoryRoots,
    enabled,
  });
};
