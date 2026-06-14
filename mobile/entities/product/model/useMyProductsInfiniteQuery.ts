import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { myProductsQueryKeys } from "@/shared/api";

import { fetchMyProductsPage } from "../api/fetchMyProductsPage";

type UseMyProductsInfiniteQueryOptions = {
  search?: string;
  enabled?: boolean;
};

export const useMyProductsInfiniteQuery = ({
  search,
  enabled = true,
}: UseMyProductsInfiniteQueryOptions = {}) => {
  const queryKeyParams = { search: search?.trim() ?? "" };

  const query = useInfiniteQuery({
    queryKey: myProductsQueryKeys.list(queryKeyParams),
    queryFn: ({ pageParam }) =>
      fetchMyProductsPage({
        page: pageParam,
        search: queryKeyParams.search || undefined,
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
  };
};
