import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchMyProductsPage } from "@/entities/product/api/fetchMyProductsPage";
import type {
  MyProductsCatalogSort,
  MyProductsModerationFilter,
} from "@/entities/product/model/productConstants";
import { myProductsQueryKeys } from "@/shared/api";

type UseMyProductsInfiniteQueryOptions = {
  search?: string;
  sort?: MyProductsCatalogSort;
  moderationStatus?: MyProductsModerationFilter;
  enabled?: boolean;
};

export const useMyProductsInfiniteQuery = ({
  search,
  sort,
  moderationStatus = "",
  enabled = true,
}: UseMyProductsInfiniteQueryOptions = {}) => {
  const queryKeyParams = {
    search: search?.trim() ?? "",
    sort: sort ?? "",
    moderationStatus: moderationStatus ?? "",
  };

  const query = useInfiniteQuery({
    queryKey: myProductsQueryKeys.list(queryKeyParams),
    queryFn: ({ pageParam }) =>
      fetchMyProductsPage({
        page: pageParam,
        search: queryKeyParams.search || undefined,
        sort: queryKeyParams.sort || undefined,
        moderationStatus:
          queryKeyParams.moderationStatus === ""
            ? undefined
            : (queryKeyParams.moderationStatus as "pending" | "rejected"),
      }),
    initialPageParam: 1,
    enabled,
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

  const total = query.data?.pages[0]?.pagination.total ?? 0;

  return {
    ...query,
    products,
    total,
    queryKeyParams,
  };
};
