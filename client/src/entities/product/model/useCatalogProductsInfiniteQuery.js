import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useRef } from "react";

import { fetchCatalogProductsPage } from "../api/fetchCatalogProductsPage.js";
import { fetchMyProductsPage } from "../api/fetchMyProducts.js";
import { buildCatalogListQueryParams } from "../lib/buildCatalogListQueryParams.js";
import { flattenCatalogProducts } from "../lib/catalogProductsQueryCache.js";
import { CATALOG_PAGE_SIZE } from "../model/productConstants.js";
import { catalogQueryKeys } from "../model/catalogQueryKeys.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useInfiniteScrollSentinel } from "../../../shared/lib/useInfiniteScrollSentinel.js";

/**
 * @param {object} params
 */
export function useCatalogProductsInfiniteQuery({
  isCatalogProductsView,
  isMineMode,
  isCatalogBrowserMainViewActive,
  activeCatalogBrowserCategory,
  activeCatalogBrowserCategoryId,
  catalogQueryFromUrl,
  debouncedProductSearchTerm,
  selectedProductCategory,
  catalogSort,
  myProductsModerationFilter,
  canModerateProducts,
  showHiddenCatalogProducts,
}) {
  const catalogSentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const listParams = useMemo(
    () =>
      buildCatalogListQueryParams({
        isMineMode,
        isCatalogBrowserMainViewActive,
        activeCatalogBrowserCategory,
        activeCatalogBrowserCategoryId,
        catalogQueryFromUrl,
        debouncedProductSearchTerm,
        selectedProductCategory,
        catalogSort,
        myProductsModerationFilter,
        canModerateProducts,
        showHiddenCatalogProducts,
      }),
    [
      isMineMode,
      isCatalogBrowserMainViewActive,
      activeCatalogBrowserCategory,
      activeCatalogBrowserCategoryId,
      catalogQueryFromUrl,
      debouncedProductSearchTerm,
      selectedProductCategory,
      catalogSort,
      myProductsModerationFilter,
      canModerateProducts,
      showHiddenCatalogProducts,
    ],
  );

  const query = useInfiniteQuery({
    queryKey: catalogQueryKeys.list(listParams),
    enabled: isCatalogProductsView,
    initialPageParam: 1,
    retry: 1,
    queryFn: async ({ pageParam }) => {
      const pageNum = Number(pageParam) || 1;
      const search = listParams.search ?? undefined;
      const productCategory = listParams.productCategory ?? undefined;
      const categoryId = listParams.categoryId ?? undefined;

      if (listParams.scope === "my") {
        return fetchMyProductsPage({
          page: pageNum,
          limit: CATALOG_PAGE_SIZE,
          search,
          productCategory,
          sort: listParams.sort ?? undefined,
          moderationStatus: listParams.moderationStatus ?? undefined,
        });
      }

      return fetchCatalogProductsPage({
        page: pageNum,
        limit: CATALOG_PAGE_SIZE,
        search,
        productCategory,
        categoryId,
        sort: listParams.sort ?? undefined,
        includeHidden: Boolean(listParams.includeHidden),
        followingOnly: Boolean(listParams.followingOnly),
        auctionOnly: Boolean(listParams.auctionOnly),
        installmentOnly: Boolean(listParams.installmentOnly),
        saleOnly: Boolean(listParams.saleOnly),
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });

  const products = useMemo(() => flattenCatalogProducts(query.data), [query.data]);

  const catalogStatus = useMemo(() => {
    if (!isCatalogProductsView) {
      return { kind: "idle" };
    }
    if (query.isPending && !query.data) {
      return { kind: "loading" };
    }
    if (query.isError) {
      const message =
        query.error instanceof Error
          ? query.error.message
          : HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK;
      return { kind: "error", message };
    }
    return { kind: "idle" };
  }, [isCatalogProductsView, query.data, query.error, query.isError, query.isPending]);

  const catalogHasMore = Boolean(query.hasNextPage);
  const isCatalogLoadingMore = query.isFetchingNextPage;
  const catalogLoadMoreError =
    query.isFetchNextPageError && query.error instanceof Error
      ? query.error.message
      : query.isFetchNextPageError
        ? HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK
        : null;

  const loadNextCatalogPage = useCallback(() => {
    if (!catalogHasMore || isCatalogLoadingMore || catalogStatus.kind !== "idle") {
      return;
    }
    void query.fetchNextPage();
  }, [catalogHasMore, catalogStatus.kind, isCatalogLoadingMore, query]);

  useInfiniteScrollSentinel({
    enabled:
      isCatalogProductsView &&
      catalogStatus.kind === "idle" &&
      catalogHasMore &&
      !catalogLoadMoreError,
    sentinelRef: catalogSentinelRef,
    onIntersect: loadNextCatalogPage,
    observeRevision: products.length,
  });

  const handleRetryCatalogLoadMore = useCallback(() => {
    void query.fetchNextPage();
  }, [query]);

  return {
    query,
    listParams,
    products,
    catalogStatus,
    catalogSentinelRef,
    catalogHasMore,
    isCatalogLoadingMore,
    catalogLoadMoreError,
    handleRetryCatalogLoadMore,
  };
}
