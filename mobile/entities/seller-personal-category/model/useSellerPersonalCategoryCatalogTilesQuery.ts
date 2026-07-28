import { useQuery } from "@tanstack/react-query";

import { sellerPersonalCategoryQueryKeys } from "@/shared/api";

import { fetchSellerPersonalCategoryCatalogTiles } from "../api/fetchSellerPersonalCategoryCatalogTiles";

export const useSellerPersonalCategoryCatalogTilesQuery = ({
  enabled = true,
  regionCode = "",
}: { enabled?: boolean; regionCode?: string } = {}) => {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(regionCode),
    queryFn: () =>
      fetchSellerPersonalCategoryCatalogTiles({ regionCode: regionCode || undefined }),
    enabled,
  });
};
