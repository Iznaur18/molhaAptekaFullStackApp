import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductFacets } from "../api/fetchCatalogProductFacets";
import type { CatalogProductsRequestOptions } from "../api/fetchCatalogProductsPage";

/** Сервер держит фасеты в кэше 20 с — чаще перезапрашивать те же параметры незачем. */
const CATALOG_FACETS_STALE_MS = 20_000;

/** Счётчики окна фильтров. Пока считается новый вариант, остаётся прежний ответ. */
export const useCatalogProductFacetsQuery = ({
  params,
  enabled,
}: {
  params: CatalogProductsRequestOptions;
  enabled: boolean;
}) =>
  useQuery({
    queryKey: catalogQueryKeys.facets(params),
    queryFn: () => fetchCatalogProductFacets(params),
    enabled,
    staleTime: CATALOG_FACETS_STALE_MS,
    placeholderData: keepPreviousData,
    retry: 1,
  });
