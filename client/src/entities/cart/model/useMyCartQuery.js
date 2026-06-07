import { useQuery } from "@tanstack/react-query";

import { fetchMyCart } from "../api/fetchMyCart.js";
import { cartQueryKeys } from "./cartQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useMyCartQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: cartQueryKeys.my(),
    enabled,
    queryFn: fetchMyCart,
  });
}
