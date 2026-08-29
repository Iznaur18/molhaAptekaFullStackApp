import { isCatalogProductViewerPurchaseContextKnown } from "@molha/api-contract";
import { useQuery } from "@tanstack/react-query";

import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductById } from "../api/fetchCatalogProductById";

export const useCatalogProductQuery = (productId: string) => {
  return useQuery({
    queryKey: catalogQueryKeys.product(productId),
    queryFn: () => fetchCatalogProductById(productId),
    enabled: Boolean(productId),
    refetchOnMount: (query) => {
      if (!isCatalogProductViewerPurchaseContextKnown(query.state.data)) {
        return "always";
      }
      return query.isStale();
    },
  });
};
