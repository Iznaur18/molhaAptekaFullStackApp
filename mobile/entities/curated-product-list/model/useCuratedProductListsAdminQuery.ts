import { useQuery } from "@tanstack/react-query";

import { fetchCuratedProductListsAdmin } from "@/entities/curated-product-list/api/curatedProductListAdminApi";
import { curatedProductListAdminQueryKeys } from "@/shared/api";

export const useCuratedProductListsAdminQuery = (enabled = true) =>
  useQuery({
    queryKey: curatedProductListAdminQueryKeys.all,
    queryFn: fetchCuratedProductListsAdmin,
    enabled,
  });
