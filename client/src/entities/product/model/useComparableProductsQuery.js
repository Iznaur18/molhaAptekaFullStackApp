import { useQuery } from "@tanstack/react-query";

import { fetchComparableProducts } from "../api/fetchComparableProducts.js";
import { catalogQueryKeys } from "./catalogQueryKeys.js";

/**
 * @param {{
 *   productId: string | null | undefined;
 *   enabled?: boolean;
 * }} params
 */
export function useComparableProductsQuery({ productId, enabled = true }) {
  const id = productId != null ? String(productId).trim() : "";

  return useQuery({
    queryKey: [...catalogQueryKeys.all, "compare", id],
    enabled: enabled && id.length > 0,
    queryFn: () => fetchComparableProducts(id),
    staleTime: 60_000,
  });
}
