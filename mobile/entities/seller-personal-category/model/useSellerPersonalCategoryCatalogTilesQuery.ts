import { useQuery } from "@tanstack/react-query";

import { sellerPersonalCategoryQueryKeys } from "@/shared/api";

import { fetchSellerPersonalCategoryCatalogTiles } from "../api/fetchSellerPersonalCategoryCatalogTiles";

export const useSellerPersonalCategoryCatalogTilesQuery = (enabled = true) => {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.catalogTiles(),
    queryFn: fetchSellerPersonalCategoryCatalogTiles,
    enabled,
  });
};
