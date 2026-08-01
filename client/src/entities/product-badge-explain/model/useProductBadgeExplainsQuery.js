import { useQuery } from "@tanstack/react-query";

import { fetchProductBadgeExplains } from "../api/fetchProductBadgeExplains.js";
import { productBadgeExplainQueryKeys } from "../lib/productBadgeExplainQueryKeys.js";

export function useProductBadgeExplainsQuery(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productBadgeExplainQueryKeys.list(),
    queryFn: fetchProductBadgeExplains,
    enabled,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}
