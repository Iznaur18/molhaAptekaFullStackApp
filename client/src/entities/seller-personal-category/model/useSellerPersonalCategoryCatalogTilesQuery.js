import { useQuery } from "@tanstack/react-query";

import { fetchSellerPersonalCategoryCatalogTiles } from "../api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "./sellerPersonalCategoryQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useSellerPersonalCategoryCatalogTilesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
    queryFn: async () => {
      const result = await fetchSellerPersonalCategoryCatalogTiles();
      return result.tiles;
    },
    enabled,
  });
}
