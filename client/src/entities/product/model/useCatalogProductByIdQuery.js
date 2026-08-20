import { useQuery } from "@tanstack/react-query";

import { fetchCatalogProductById } from "../api/fetchCatalogProductById.js";
import { catalogQueryKeys } from "./catalogQueryKeys.js";

/**
 * @param {{ productId: string | null | undefined; enabled?: boolean }} params
 */
export function useCatalogProductByIdQuery({ productId, enabled = true }) {
  const id = productId != null ? String(productId) : "";

  return useQuery({
    queryKey: catalogQueryKeys.byId(id),
    enabled: enabled && Boolean(id),
    queryFn: () => fetchCatalogProductById(id),
    // Seed из карточки каталога — сразу полный UI без skeleton.
    staleTime: 30_000,
  });
}
