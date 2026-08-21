import { useQuery } from "@tanstack/react-query";

import { fetchMyProductBuyNFreeProgress } from "../api/fetchMyProductBuyNFreeProgress.js";

/**
 * @param {{
 *   productId?: string | null;
 *   enabled?: boolean;
 * }} input
 */
export function useMyProductBuyNFreeProgressQuery({ productId, enabled = true }) {
  const id = String(productId ?? "").trim();
  return useQuery({
    queryKey: ["product-buy-n-free-progress", id],
    queryFn: () => fetchMyProductBuyNFreeProgress(id),
    enabled: enabled && id.length > 0,
    staleTime: 15_000,
  });
}
