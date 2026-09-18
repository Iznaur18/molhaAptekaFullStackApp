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
 * Следующую страницу ленты просим за два экрана до конца: при 200 px человек
 * каждый раз упирался в низ ленты и ждал ответа и картинок (18.09.2026).
 */
const CATALOG_SENTINEL_ROOT_MARGIN = "0px 0px 200% 0px";

/**
 * Один повтор при сбое, но не на 429: повтор только съедает лимит каталога.
 *
 * @param {number} failureCount
 * @param {unknown} error
 */
function shouldRetryCatalogPage(failureCount, error) {
  if (/** @type {{ status?: number } | null} */ (error)?.status === 429) {
    return false;
  }
  return failureCount < 1;
}

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
  appliedProductSearchTerm,
  selectedProductCategory,
  catalogSort,
  myProductsModerationFilter,
  viewerRegionCode,
  nearAllowed = true,
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
        appliedProductSearchTerm,
        selectedProductCategory,
        catalogSort,
        myProductsModerationFilter,
        viewerRegionCode,
        nearAllowed,
      }),
    [
      isMineMode,
      isCatalogBrowserMainViewActive,
      activeCatalogBrowserCategory,
      activeCatalogBrowserCategoryId,
      catalogQueryFromUrl,
      appliedProductSearchTerm,
      selectedProductCategory,
      catalogSort,
      myProductsModerationFilter,
      viewerRegionCode,
      nearAllowed,
    ],
  );

  const query = useInfiniteQuery({
    queryKey: catalogQueryKeys.list(listParams),
    enabled: isCatalogProductsView,
    initialPageParam: 1,
    retry: shouldRetryCatalogPage,
    queryFn: async ({ pageParam }) => {
      const pageNum = Number(pageParam) || 1;
      const search = listParams.search ?? undefined;
      const productCategory = listParams.productCategory ?? undefined;
      const categoryId = listParams.categoryId ?? undefined;
      const sellerPersonalCategoryId = listParams.sellerPersonalCategoryId ?? undefined;

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
        sellerPersonalCategoryId,
        sort: listParams.sort ?? undefined,
        followingOnly: Boolean(listParams.followingOnly),
        auctionOnly: Boolean(listParams.auctionOnly),
        installmentOnly: Boolean(listParams.installmentOnly),
        saleOnly: Boolean(listParams.saleOnly),
        rentalOnly: Boolean(listParams.rentalOnly),
        affiliateOnly: Boolean(listParams.affiliateOnly),
        wholesaleOnly: Boolean(listParams.wholesaleOnly),
        buyNFreeOnly: Boolean(listParams.buyNFreeOnly),
        originalOnly: Boolean(listParams.originalOnly),
        near: Boolean(listParams.near),
        flashSaleOnly: Boolean(listParams.flashSaleOnly),
        priceMin: listParams.priceMin,
        priceMax: listParams.priceMax,
        delivery: listParams.delivery,
        pickupOnly: Boolean(listParams.pickupOnly),
        ratingMin: listParams.ratingMin,
        withReviews: Boolean(listParams.withReviews),
        returnOnly: Boolean(listParams.returnOnly),
        sellerConfirmed: Boolean(listParams.sellerConfirmed),
        sellerPremium: Boolean(listParams.sellerPremium),
        regionCode: listParams.regionCode || undefined,
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
    // Сбой догрузки или фонового обновления не стирает уже показанную ленту:
    // для него внизу плашка «Повторить» (catalogLoadMoreError). Раньше ответ
    // 429 на 119-й странице заменял всю ленту экраном ошибки и бросал наверх.
    if (query.isError && !query.data) {
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
    rootMargin: CATALOG_SENTINEL_ROOT_MARGIN,
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
