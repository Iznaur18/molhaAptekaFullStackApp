import { useQuery } from "@tanstack/react-query";

import { curatedProductListQueryKeys } from "@/shared/api";

import { fetchHomeCuratedProductLists } from "../api/fetchHomeCuratedProductLists";

type HomeCuratedProductListsQueryOptions = {
  enabled?: boolean;
  allCities?: boolean;
};

export const useHomeCuratedProductListsQuery = ({
  enabled = true,
  allCities = false,
}: HomeCuratedProductListsQueryOptions = {}) =>
  useQuery({
    queryKey: curatedProductListQueryKeys.home(allCities),
    queryFn: () => fetchHomeCuratedProductLists({ allCities }),
    enabled,
  });
