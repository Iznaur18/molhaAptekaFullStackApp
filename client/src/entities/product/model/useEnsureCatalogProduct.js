import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { fetchCatalogProductById } from "../api/fetchCatalogProductById.js";
import { catalogQueryKeys } from "./catalogQueryKeys.js";

export function useEnsureCatalogProduct() {
  const queryClient = useQueryClient();

  return useCallback(
    /**
     * @param {string} productId
     */
    (productId) => {
      const id = String(productId);
      return queryClient.ensureQueryData({
        queryKey: catalogQueryKeys.byId(id),
        queryFn: () => fetchCatalogProductById(id),
      });
    },
    [queryClient],
  );
}
