import { useQuery } from "@tanstack/react-query";

import { fetchProductManageToggleDisplays } from "../api/fetchProductManageToggleDisplays";
import { productManageToggleDisplayQueryKeys } from "../lib/productManageToggleDisplayQueryKeys";

type UseProductManageToggleDisplaysQueryOptions = {
  enabled?: boolean;
};

export const useProductManageToggleDisplaysQuery = ({
  enabled = true,
}: UseProductManageToggleDisplaysQueryOptions = {}) =>
  useQuery({
    queryKey: productManageToggleDisplayQueryKeys.list(),
    queryFn: fetchProductManageToggleDisplays,
    enabled,
    staleTime: 60_000,
  });
