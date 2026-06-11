import { useQuery } from "@tanstack/react-query";

import { fetchHomeCuratedProductLists } from "../api/fetchHomeCuratedProductLists.js";
import { curatedProductListQueryKeys } from "./curatedProductListQueryKeys.js";

/**
 * @param {{ enabled?: boolean; allCities?: boolean }} [params]
 */
export function useHomeCuratedProductListsQuery({ enabled = true, allCities = false } = {}) {
  return useQuery({
    queryKey: curatedProductListQueryKeys.home(allCities),
    enabled,
    queryFn: () => fetchHomeCuratedProductLists({ allCities }),
  });
}
