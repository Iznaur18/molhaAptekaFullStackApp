import { useQuery } from "@tanstack/react-query";

import { fetchCuratedCategoryListsAdmin } from "../api/curatedCategoryListAdminApi";
import { curatedCategoryListQueryKeys } from "./curatedCategoryListQueryKeys";

export const useCuratedCategoryListsAdminQuery = (enabled = true) =>
  useQuery({
    queryKey: curatedCategoryListQueryKeys.admin(),
    queryFn: fetchCuratedCategoryListsAdmin,
    enabled,
  });
