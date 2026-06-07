import { useQuery } from "@tanstack/react-query";

import { fetchProductCatalogFeedTileDisplays } from "../api/fetchProductCatalogFeedTileDisplays.js";
import { productCategoryDisplayQueryKeys } from "./productCategoryDisplayQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductCatalogFeedTileDisplaysQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: productCategoryDisplayQueryKeys.feedTiles(),
    enabled,
    queryFn: fetchProductCatalogFeedTileDisplays,
    select: (data) => data.displays,
  });
}
