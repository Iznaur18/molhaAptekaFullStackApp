import { useQuery } from "@tanstack/react-query";

import { fetchCuratedProductListsAdmin } from "../api/fetchCuratedProductListsAdmin.js";
import { curatedProductListQueryKeys } from "./curatedProductListQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useCuratedProductListsAdminQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: curatedProductListQueryKeys.admin(),
    enabled,
    queryFn: fetchCuratedProductListsAdmin,
  });
}
