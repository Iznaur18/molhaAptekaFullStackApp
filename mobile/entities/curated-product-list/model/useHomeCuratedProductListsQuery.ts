import { useQuery } from "@tanstack/react-query";

import { curatedProductListQueryKeys } from "@/shared/api";

import { fetchHomeCuratedProductLists } from "../api/fetchHomeCuratedProductLists";

export const useHomeCuratedProductListsQuery = (enabled = true) =>
  useQuery({
    queryKey: curatedProductListQueryKeys.home(),
    queryFn: fetchHomeCuratedProductLists,
    enabled,
  });
