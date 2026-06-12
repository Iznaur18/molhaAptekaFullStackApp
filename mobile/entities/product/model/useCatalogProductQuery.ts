import { useQuery } from "@tanstack/react-query";

import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductById } from "../api/fetchCatalogProductById";

export const useCatalogProductQuery = (productId: string) => {
  return useQuery({
    queryKey: catalogQueryKeys.product(productId),
    queryFn: () => fetchCatalogProductById(productId),
    enabled: Boolean(productId),
  });
};
