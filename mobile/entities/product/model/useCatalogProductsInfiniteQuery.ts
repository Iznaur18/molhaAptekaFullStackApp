import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductsPage } from "../api/fetchCatalogProductsPage";
import { flattenCatalogProducts } from "../lib/flattenCatalogProducts";
import { buildCatalogListQueryKey, type CatalogListFilters } from "./catalogListFilters";

export const useCatalogProductsInfiniteQuery = (filters: CatalogListFilters) => {
  const queryKeyParams = buildCatalogListQueryKey(filters);

  const query = useInfiniteQuery({
    queryKey: catalogQueryKeys.list(queryKeyParams),
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
