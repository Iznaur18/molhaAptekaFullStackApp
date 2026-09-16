import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchCatalogProductFacets } from "../api/fetchCatalogProductFacets.js";
import { catalogQueryKeys } from "./catalogQueryKeys.js";

/** Сервер держит фасеты в кэше 20 с — чаще перезапрашивать те же параметры незачем. */
const CATALOG_FACETS_STALE_MS = 20_000;

/**
 * Счётчики окна фильтров. Пока считается новый вариант, остаётся прежний ответ.
 *
 * @param {{
 *   params: import('../api/fetchCatalogProductsPage.js').CatalogProductsRequestOptions;
 *   enabled: boolean;
 * }} options
 */
export function useCatalogProductFacetsQuery({ params, enabled }) {
  return useQuery({
    queryKey: catalogQueryKeys.facets(params),
    queryFn: () => fetchCatalogProductFacets(params),
    enabled,
    staleTime: CATALOG_FACETS_STALE_MS,
    placeholderData: keepPreviousData,
    retry: 1,
  });
}
