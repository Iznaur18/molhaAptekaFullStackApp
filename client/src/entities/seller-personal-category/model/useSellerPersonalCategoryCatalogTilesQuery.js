import { useQuery } from "@tanstack/react-query";

import { fetchSellerPersonalCategoryCatalogTiles } from "../api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "./sellerPersonalCategoryQueryKeys.js";

/**
 * @param {{ enabled?: boolean; regionCode?: string }} [options]
 */
export function useSellerPersonalCategoryCatalogTilesQuery({
  enabled = true,
  regionCode = "",
} = {}) {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(regionCode),
    queryFn: async () => {
      const result = await fetchSellerPersonalCategoryCatalogTiles({
        regionCode: regionCode || undefined,
      });
      return result.tiles;
    },
    enabled,
  });
}
