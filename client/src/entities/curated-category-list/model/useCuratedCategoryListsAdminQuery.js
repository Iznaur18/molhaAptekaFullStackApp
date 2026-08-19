import { useQuery } from "@tanstack/react-query";

import { fetchCuratedCategoryListsAdmin } from "../api/fetchCuratedCategoryListsAdmin.js";
import { curatedCategoryListQueryKeys } from "./curatedCategoryListQueryKeys.js";

export function useCuratedCategoryListsAdminQuery() {
  return useQuery({
    queryKey: curatedCategoryListQueryKeys.admin(),
    queryFn: fetchCuratedCategoryListsAdmin,
  });
}
