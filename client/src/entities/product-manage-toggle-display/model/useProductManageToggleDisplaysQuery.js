import { useQuery } from "@tanstack/react-query";

import { fetchProductManageToggleDisplays } from "../api/fetchProductManageToggleDisplays.js";
import { productManageToggleDisplayQueryKeys } from "../lib/productManageToggleDisplayQueryKeys.js";

export function useProductManageToggleDisplaysQuery(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: productManageToggleDisplayQueryKeys.list(),
    queryFn: fetchProductManageToggleDisplays,
    enabled,
    staleTime: 60_000,
  });
}
