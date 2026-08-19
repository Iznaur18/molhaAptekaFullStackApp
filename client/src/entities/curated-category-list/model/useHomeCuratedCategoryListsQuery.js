import { useQuery } from "@tanstack/react-query";

import { fetchHomeCuratedCategoryLists } from "../api/fetchHomeCuratedCategoryLists.js";
import { curatedCategoryListQueryKeys } from "./curatedCategoryListQueryKeys.js";

/**
 * @param {{ enabled?: boolean; regionCode?: string }} [params]
 */
export function useHomeCuratedCategoryListsQuery({ enabled = true, regionCode = "" } = {}) {
  return useQuery({
    queryKey: curatedCategoryListQueryKeys.home(regionCode),
    enabled,
    queryFn: () => fetchHomeCuratedCategoryLists({ regionCode: regionCode || undefined }),
  });
}
