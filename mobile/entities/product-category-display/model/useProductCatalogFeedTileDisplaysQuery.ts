import { useQuery } from "@tanstack/react-query";

import { categoryDisplayQueryKeys } from "@/shared/api";

import { fetchProductCatalogFeedTileDisplays } from "../api/fetchProductCatalogFeedTileDisplays";

export const useProductCatalogFeedTileDisplaysQuery = (enabled = true) => {
  return useQuery({
    queryKey: categoryDisplayQueryKeys.feedTiles(),
    queryFn: fetchProductCatalogFeedTileDisplays,
    enabled,
  });
};
