import { useQuery } from "@tanstack/react-query";

import { fetchPublicSellerOneCShelves } from "../api/sellerShelfApi.js";
import { sellerShelfQueryKeys } from "./sellerShelfQueryKeys.js";

/**
 * Полки витрины из 1С. У продавца без обмена список пустой — блок просто не
 * рисуется, отдельного признака «есть 1С» для этого не нужно.
 *
 * @param {{ sellerId: string; enabled?: boolean }} opts
 */
export function usePublicSellerOneCShelvesQuery({ sellerId, enabled = true }) {
  const id = String(sellerId ?? "").trim();
  return useQuery({
    queryKey: sellerShelfQueryKeys.publicOneCBySeller(id),
    queryFn: () => fetchPublicSellerOneCShelves(id),
    enabled: enabled && Boolean(id),
    staleTime: 60_000,
  });
}
