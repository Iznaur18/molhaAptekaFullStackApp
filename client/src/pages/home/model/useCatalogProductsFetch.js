import { useCallback, useEffect, useRef, useState } from "react";

import { fetchCatalogProductsPage } from "../../../entities/product/api/fetchCatalogProductsPage.js";
import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import { CATALOG_PAGE_SIZE } from "../../../entities/product/model/productConstants.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { useCatalogInfiniteScroll } from "./useCatalogInfiniteScroll.js";

/**
 * @param {object} params
 */
export function useCatalogProductsFetch({
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
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogSaleOnly,
  catalogRefreshTick,
  products,
  setProducts,
  catalogStatus,
  setCatalogStatus,
  setMyProductsTotal,
}) {
  const catalogFetchSeq = useRef(0);
  const catalogPageRef = useRef(0);
  const catalogSentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [catalogHasMore, setCatalogHasMore] = useState(false);
  const [isCatalogLoadingMore, setIsCatalogLoadingMore] = useState(false);
  const [catalogLoadMoreError, setCatalogLoadMoreError] = useState(
    /** @type {string | null} */ (null),
  );

  const loadCatalogPage = useCallback(
    async (pageNum) => {
      const search = debouncedProductSearchTerm.trim();
      const productCategory = isMineMode
        ? (selectedProductCategory ?? undefined)
        : isCatalogBrowserMainViewActive && !activeCatalogBrowserCategoryId
          ? (activeCatalogBrowserCategory ?? undefined)
          : undefined;
      const categoryId = isCatalogBrowserMainViewActive
        ? (activeCatalogBrowserCategoryId ?? undefined)
        : undefined;
      if (isMineMode) {
        return fetchMyProductsPage({
          page: pageNum,
          limit: CATALOG_PAGE_SIZE,
          search: search || undefined,
          productCategory,
          sort: catalogSort,
          moderationStatus: myProductsModerationFilter || undefined,
        });
      }
      return fetchCatalogProductsPage({
        page: pageNum,
        limit: CATALOG_PAGE_SIZE,
        search: search || undefined,
        productCategory,
        categoryId,
        sort: catalogQueryFromUrl.sort,
        includeHidden: canModerateProducts && !isMineMode && showHiddenCatalogProducts,
        followingOnly: catalogQueryFromUrl.followingOnly,
        auctionOnly: catalogQueryFromUrl.auctionOnly,
        installmentOnly: catalogQueryFromUrl.installmentOnly,
        saleOnly: catalogQueryFromUrl.saleOnly,
      });
    },
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

  useEffect(() => {
    if (!isCatalogProductsView) {
      return undefined;
    }

    const seq = ++catalogFetchSeq.current;
    setProducts([]);
    catalogPageRef.current = 0;
    setCatalogHasMore(true);
    setCatalogLoadMoreError(null);
    setIsCatalogLoadingMore(false);
    setCatalogStatus({ kind: "loading" });

    void (async () => {
      try {
        const { products: pageProducts, pagination } = await loadCatalogPage(1);
        if (seq !== catalogFetchSeq.current) {
          return;
        }
        setProducts(pageProducts);
        catalogPageRef.current = 1;
        setCatalogHasMore(pagination.page < pagination.totalPages);
        if (
          isMineMode &&
          !debouncedProductSearchTerm.trim() &&
          !selectedProductCategory &&
          !myProductsModerationFilter
        ) {
          setMyProductsTotal(pagination.total);
        }
        setCatalogStatus({ kind: "idle" });
      } catch (e) {
        if (seq !== catalogFetchSeq.current) {
          return;
        }
        const message =
          e?.response?.data?.message ??
          e?.message ??
          HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK;
        setCatalogStatus({ kind: "error", message });
      }
    })();
  }, [
    isCatalogProductsView,
    isMineMode,
    debouncedProductSearchTerm,
    selectedProductCategory,
    activeCatalogBrowserCategory,
    catalogQueryFromUrl,
    catalogSort,
    myProductsModerationFilter,
    showHiddenCatalogProducts,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogSaleOnly,
    loadCatalogPage,
    catalogRefreshTick,
    setProducts,
    setCatalogStatus,
    setMyProductsTotal,
  ]);

  const loadNextCatalogPage = useCallback(async () => {
    if (!catalogHasMore || isCatalogLoadingMore) {
      return;
    }
    if (catalogStatus.kind !== "idle") {
      return;
    }

    const seqAtStart = catalogFetchSeq.current;
    const nextPage = catalogPageRef.current + 1;

    setIsCatalogLoadingMore(true);
    setCatalogLoadMoreError(null);

    try {
      const { products: pageProducts, pagination } = await loadCatalogPage(nextPage);
      if (seqAtStart !== catalogFetchSeq.current) {
        return;
      }

      setProducts((prev) => {
        const seen = new Set(prev.map((p) => String(p._id)));
        const addon = pageProducts.filter((p) => !seen.has(String(p._id)));
        return [...prev, ...addon];
      });
      catalogPageRef.current = nextPage;
      setCatalogHasMore(pagination.page < pagination.totalPages);
    } catch (e) {
      if (seqAtStart !== catalogFetchSeq.current) {
        return;
      }
      setCatalogLoadMoreError(
        e instanceof Error ? e.message : HOME_PAGE_UI.FETCH_PRODUCTS_FALLBACK,
      );
    } finally {
      if (seqAtStart === catalogFetchSeq.current) {
        setIsCatalogLoadingMore(false);
      }
    }
  }, [
    catalogHasMore,
    isCatalogLoadingMore,
    catalogStatus.kind,
    loadCatalogPage,
    setProducts,
  ]);

  useCatalogInfiniteScroll({
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
    setCatalogLoadMoreError(null);
    void loadNextCatalogPage();
  }, [loadNextCatalogPage]);

  return {
    catalogSentinelRef,
    catalogHasMore,
    isCatalogLoadingMore,
    catalogLoadMoreError,
    handleRetryCatalogLoadMore,
  };
}
