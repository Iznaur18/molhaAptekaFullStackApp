import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

import {
  fetchUserProducts,
  USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
} from "../api/fetchUserProducts.js";
import { mapSellerCatalogItemsToProducts } from "../lib/mapSellerCatalogItemsToProducts.js";
import { sellerProductsQueryKeys } from "./sellerProductsQueryKeys.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { useInfiniteScrollSentinel } from "../../../shared/lib/useInfiniteScrollSentinel.js";

/**
 * @param {{ sellerId: string; enabled: boolean; shelfId?: string | null }} params
 */
export function useSellerProductsInfiniteQuery({
  sellerId,
  enabled,
  shelfId = null,
}) {
  const sentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const shelfKey = shelfId != null ? String(shelfId).trim() : "";

  const query = useInfiniteQuery({
    queryKey: sellerProductsQueryKeys.list(sellerId, shelfKey || null),
    enabled: enabled && Boolean(sellerId),
    initialPageParam: 1,
    retry: 1,
    queryFn: async ({ pageParam }) => {
      const page = Number(pageParam) || 1;
      return fetchUserProducts(sellerId, {
        page,
        limit: USER_PROFILE_PRODUCTS_API_LIMIT_MAX,
        shelfId: shelfKey || null,
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
    return query.data.pages.flatMap((page) =>
      mapSellerCatalogItemsToProducts(page.items),
    );
  }, [query.data]);

  const phase = useMemo(() => {
    if (!enabled) {
      return "idle";
    }
    if (query.isPending && !query.data) {
      return "loading";
    }
    if (query.isError) {
      return "error";
    }
    return "success";
  }, [enabled, query.data, query.isError, query.isPending]);

  const error =
    query.isError && query.error instanceof Error
      ? query.error.message
      : query.isError
        ? API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK
        : "";

  const hasMore = Boolean(query.hasNextPage);
  const isLoadingMore = query.isFetchingNextPage;
  const loadMoreError =
    query.isFetchNextPageError && query.error instanceof Error
      ? query.error.message
      : query.isFetchNextPageError
        ? API_CLIENT_UI.FETCH_USER_PRODUCTS_FALLBACK
        : null;

  const loadNextPage = useCallback(() => {
    if (!hasMore || isLoadingMore || phase !== "success") {
      return;
    }
    void query.fetchNextPage();
  }, [hasMore, isLoadingMore, phase, query]);

  useInfiniteScrollSentinel({
    enabled: enabled && phase === "success" && hasMore && !loadMoreError,
    sentinelRef,
    onIntersect: loadNextPage,
    observeRevision: products.length,
  });

  const retryLoadMore = useCallback(() => {
    void query.fetchNextPage();
  }, [query]);

  const reload = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    phase,
    products,
    error,
    hasMore,
    isLoadingMore,
    loadMoreError,
    sentinelRef,
    retryLoadMore,
    reload,
  };
}
