import { useQuery } from "@tanstack/react-query";

import { fetchProductBadgeExplains } from "../api/fetchProductBadgeExplains";
import { productBadgeExplainQueryKeys } from "../lib/productBadgeExplainQueryKeys";

export const useProductBadgeExplainsQuery = (options: { enabled?: boolean } = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productBadgeExplainQueryKeys.list(),
    queryFn: fetchProductBadgeExplains,
    enabled,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
};
