import { useQuery } from "@tanstack/react-query";

import { fetchAllProducts } from "../api/fetchAllProducts.js";
import { allProductsQueryKeys } from "./allProductsQueryKeys.js";

/**
 * @param {{ search?: string; enabled?: boolean }} [params]
 */
export function useAllProductsQuery({ search, enabled = true } = {}) {
  return useQuery({
    queryKey: allProductsQueryKeys.list({ search }),
    queryFn: () => fetchAllProducts({ search }),
    enabled,
  });
}
