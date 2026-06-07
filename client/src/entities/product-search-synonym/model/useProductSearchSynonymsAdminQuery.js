import { useQuery } from "@tanstack/react-query";

import { fetchProductSearchSynonymsAdmin } from "../api/fetchProductSearchSynonymsAdmin.js";
import { searchSynonymAdminQueryKeys } from "./searchSynonymAdminQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [params]
 */
export function useProductSearchSynonymsAdminQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: searchSynonymAdminQueryKeys.all,
    enabled,
    queryFn: fetchProductSearchSynonymsAdmin,
  });
}
