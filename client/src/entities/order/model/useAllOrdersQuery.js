import { useQuery } from "@tanstack/react-query";

import { fetchAllOrders } from "../api/fetchAllOrders.js";
import { orderQueryKeys } from "./orderQueryKeys.js";

/**
 * @param {{
 *   status?: string;
 *   limit?: number;
 *   page?: number;
 *   enabled?: boolean;
 * }} params
 */
export function useAllOrdersQuery({ status, limit, page, enabled = true }) {
  const params = {
    ...(status ? { status } : {}),
    ...(limit != null ? { limit } : {}),
    ...(page != null ? { page } : {}),
  };

  return useQuery({
    queryKey: orderQueryKeys.admin(params),
    enabled,
    queryFn: () => fetchAllOrders(params),
  });
}
