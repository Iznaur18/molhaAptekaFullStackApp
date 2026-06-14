import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { catalogQueryKeys } from "@/shared/api";

import { fetchCatalogProductsPage } from "../api/fetchCatalogProductsPage";
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
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  const products = useMemo(() => {
    if (!query.data?.pages) {
      return [];
    }
    return query.data.pages.flatMap((page) => page.products);
  }, [query.data]);

  return {
    ...query,
    products,
  };
};
