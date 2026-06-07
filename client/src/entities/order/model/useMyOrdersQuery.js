import { useQuery } from "@tanstack/react-query";

import { fetchMyOrders } from "../api/fetchMyOrders.js";
import { orderQueryKeys } from "./orderQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyOrdersQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: orderQueryKeys.my(),
    enabled,
    queryFn: fetchMyOrders,
  });
}
