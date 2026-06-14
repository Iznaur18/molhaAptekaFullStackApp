import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { API_CLIENT_UI } from "@/shared/config";

import {
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
} from "../api/fetchUserProducts";
import { mapSellerCatalogItemsToProducts } from "../lib/mapSellerCatalogItemsToProducts";
import { sellerProductsQueryKeys } from "./sellerProductsQueryKeys";

type UseSellerProductsInfiniteQueryOptions = {
  sellerId: string;
  enabled: boolean;
};

export const useSellerProductsInfiniteQuery = ({
  sellerId,
  enabled,
}: UseSellerProductsInfiniteQueryOptions) => {
  const query = useInfiniteQuery({
    queryKey: sellerProductsQueryKeys.list(sellerId),
    enabled: enabled && Boolean(sellerId),
    initialPageParam: 1,
    retry: 1,
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam) || 1;
      return fetchUserProducts(sellerId, {
        page,
        limit: USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.hasMore) {
        return (lastPage.pagination.page ?? 1) + 1;
      }
      return undefined;
    },
  });

  const products = useMemo(() => {
    if (!query.data?.pages) {
      return [];
    }
    return query.data.pages.flatMap((page) => mapSellerCatalogItemsToProducts(page.items));
  }, [query.data]);

  const phase = useMemo(() => {
    if (!enabled) {
      return "idle" as const;
    }
    if (query.isPending && !query.data) {
      return "loading" as const;
    }
    if (query.isError) {
      return "error" as const;
    }
    return "success" as const;
  }, [enabled, query.data, query.isError, query.isPending]);

  const error =
    query.isError && query.error instanceof Error
      ? query.error.message
      : query.isError
        ? API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK
        : "";

  return {
    ...query,
    phase,
    products,
    error,
    hasMore: Boolean(query.hasNextPage),
    isLoadingMore: query.isFetchingNextPage,
    loadMoreError:
      query.isFetchNextPageError && query.error instanceof Error
        ? query.error.message
        : query.isFetchNextPageError
          ? API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK
          : null,
  };
};
