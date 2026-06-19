import type { QueryClient } from "@tanstack/react-query";

import { catalogQueryKeys } from "@/shared/api";

export const seedCatalogProductQueryCache = (
  queryClient: QueryClient,
  product: Record<string, unknown> | null | undefined,
) => {
  const productId = product?._id != null ? String(product._id) : "";
  if (!productId) {
    return;
  }

  queryClient.setQueryData(catalogQueryKeys.product(productId), product);
};
