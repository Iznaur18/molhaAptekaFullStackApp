import { useQuery } from "@tanstack/react-query";

import { fetchMySales } from "../api/fetchMySales.js";
import { orderQueryKeys } from "./orderQueryKeys.js";

/**
 * @param {{
 *   status?: string;
 *   search?: string;
 *   enabled?: boolean;
 * }} params
 */
export function useMySalesQuery({ status, search, enabled = true }) {
  const params = {
    ...(status ? { status } : {}),
    ...(search ? { search } : {}),
  };

  return useQuery({
    queryKey: orderQueryKeys.sales(params),
    enabled,
    queryFn: () => fetchMySales(params),
  });
}
