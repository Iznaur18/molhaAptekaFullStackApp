import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { shouldRetainCatalogListPlaceholderData } from "@/entities/product/lib/shouldRetainCatalogListPlaceholderData";
import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductsPage } from "../api/fetchCatalogProductsPage";
import { flattenCatalogProducts } from "../lib/flattenCatalogProducts";
import { buildCatalogListQueryKey, type CatalogListFilters } from "./catalogListFilters";

export const useCatalogProductsInfiniteQuery = (
  filters: CatalogListFilters,
  options: { enabled?: boolean } = {},
) => {
  const queryKeyParams = buildCatalogListQueryKey(filters);
  const enabled = options.enabled !== false;

  const query = useInfiniteQuery({
    queryKey: catalogQueryKeys.list(queryKeyParams),
    enabled,
    queryFn: ({ pageParam }) =>
      fetchCatalogProductsPage({
        page: pageParam,
        search: filters.search,
        productCategory: filters.productCategory,
        categoryId: filters.categoryId,
        sellerPersonalCategoryId: filters.sellerPersonalCategoryId,
        sort: filters.sort,
        followingOnly: filters.followingOnly,
        auctionOnly: filters.auctionOnly,
        installmentOnly: filters.installmentOnly,
        saleOnly: filters.saleOnly,
        allCities: filters.allCities,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    // При смене категории/поиска не держим старые плитки — иначе массовый swap
    // ProductCard на JS-потоке даёт фриз. Для смены только sort — плавный переход.
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) {
        return undefined;
      }

      const previousParams = previousQuery.queryKey[2] as typeof queryKeyParams;
      if (!shouldRetainCatalogListPlaceholderData(previousParams, queryKeyParams)) {
        return undefined;
      }

      return previousData;
    },
  });

  const products = useMemo(
    () => flattenCatalogProducts(query.data),
    [query.data],
  );

  return {
    ...query,
    products,
  };
};
