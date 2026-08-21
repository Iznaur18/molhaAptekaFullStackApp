import { useQuery } from "@tanstack/react-query";

import { fetchMyProductBuyNFreeProgress } from "@/entities/product/api/fetchMyProductBuyNFreeProgress";

export function useMyProductBuyNFreeProgressQuery({
  productId,
  enabled = true,
}: {
  productId?: string | null;
  enabled?: boolean;
}) {
  const id = String(productId ?? "").trim();
  return useQuery({
    queryKey: ["product-buy-n-free-progress", id],
    queryFn: () => fetchMyProductBuyNFreeProgress(id),
    enabled: enabled && id.length > 0,
    staleTime: 15_000,
  });
}
