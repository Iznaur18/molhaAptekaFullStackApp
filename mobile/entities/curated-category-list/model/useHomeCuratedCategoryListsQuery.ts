import { useQuery } from "@tanstack/react-query";

import { fetchHomeCuratedCategoryLists } from "../api/fetchHomeCuratedCategoryLists";
import { curatedCategoryListQueryKeys } from "./curatedCategoryListQueryKeys";

type HomeCuratedCategoryListsQueryOptions = {
  enabled?: boolean;
  regionCode?: string;
};

export const useHomeCuratedCategoryListsQuery = ({
  enabled = true,
  regionCode = "",
}: HomeCuratedCategoryListsQueryOptions = {}) =>
  useQuery({
    queryKey: curatedCategoryListQueryKeys.home(regionCode),
    queryFn: () => fetchHomeCuratedCategoryLists({ regionCode: regionCode || undefined }),
    enabled,
  });
