import { useQuery } from "@tanstack/react-query";

import { fetchHomeCuratedProductLists } from "../api/fetchHomeCuratedProductLists.js";
import { curatedProductListQueryKeys } from "./curatedProductListQueryKeys.js";

/**
 * @param {{ enabled?: boolean; regionCode?: string }} [params]
 */
export function useHomeCuratedProductListsQuery({ enabled = true, regionCode = "" } = {}) {
  return useQuery({
    queryKey: curatedProductListQueryKeys.home(regionCode),
    enabled,
    queryFn: () => fetchHomeCuratedProductLists({ regionCode: regionCode || undefined }),
  });
}
