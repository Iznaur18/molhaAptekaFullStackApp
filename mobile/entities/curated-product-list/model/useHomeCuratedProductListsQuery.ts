import { useQuery } from "@tanstack/react-query";

import { curatedProductListQueryKeys } from "@/shared/api";

import { fetchHomeCuratedProductLists } from "../api/fetchHomeCuratedProductLists";

type HomeCuratedProductListsQueryOptions = {
  enabled?: boolean;
  regionCode?: string;
};

export const useHomeCuratedProductListsQuery = ({
  enabled = true,
  regionCode = "",
}: HomeCuratedProductListsQueryOptions = {}) =>
  useQuery({
    queryKey: curatedProductListQueryKeys.home(regionCode),
    queryFn: () => fetchHomeCuratedProductLists({ regionCode: regionCode || undefined }),
    enabled,
  });
