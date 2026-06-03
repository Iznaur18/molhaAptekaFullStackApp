import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchCatalogProductsPage } from "../../../entities/product/api/fetchCatalogProductsPage.js";
import { fetchMyProductsPage } from "../../../entities/product/api/fetchMyProducts.js";
import { fetchProductCategoryDisplays } from "../../../entities/product-category-display/api/fetchProductCategoryDisplays.js";
import { buildCatalogBrowserLocation } from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { isCatalogBrowserLandingSearch } from "../../../entities/product-category-display/lib/catalogBrowserLanding.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import { resolveProductCategoryDisplay } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SORT_CONFIRMED,
  CATALOG_SORT_NEWEST,
  CATALOG_SORT_PREMIUM,
  CATALOG_SORT_VIEWS,
  MY_PRODUCTS_MODERATION_FILTER_ALL,
} from "../../../entities/product/model/productConstants.js";
import {
  API_CLIENT_UI,
  HOME_PAGE_UI,
  PRODUCT_SEARCH_UI,
} from "../../../shared/config/appUiCopy.js";
import {
  isMyProductsMainView,
  mainViewToPathname,
} from "../../../shared/lib/homeMainViewPaths.js";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue.js";
import {
  areCatalogSearchParamsEqual,
  buildCatalogSearchParams,
  CATALOG_QUERY_PARAM_CATEGORY,
  parseCatalogQueryFromSearchParams,
} from "../lib/catalogCatalogQuery.js";
import { readInitialCatalogCategory } from "../lib/homePageConstants.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} params
 */
export const useHomeCatalogLoader = ({
  location,
  navigate,
  mainView,
  isProfileMyProductsTab,
  isHomeCatalogMainView,
  isCatalogBrowserMainViewActive,
  isCatalogShellView,
  isAuthorized,
  canModerateProducts,
  setIsLoginModalOpen,
  productSearchTerm,
  products,
  setProducts,
  catalogStatus,
  setCatalogStatus,
  catalogRefreshTick,
  myProductsModerationFilter,
  setMyProductsModerationFilter,
  setMyProductsTotal,
  setMyProductsCatalogError,
  setIsProductCategoryListOpen,
  initialCatalogQuery,
}) => {
  const [selectedProductCategory, setSelectedProductCategory] = useState(
    () => readInitialCatalogCategory(),
  );
  const [catalogSort, setCatalogSort] = useState(
    () => initialCatalogQuery?.sort ?? CATALOG_SORT_NEWEST,
  );
  const [showHiddenCatalogProducts, setShowHiddenCatalogProducts] =
    useState(false);
  const [catalogFollowingOnly, setCatalogFollowingOnly] = useState(
    () => initialCatalogQuery?.followingOnly ?? false,
  );
  const [catalogAuctionOnly, setCatalogAuctionOnly] = useState(
    () => initialCatalogQuery?.auctionOnly ?? false,
  );
  const [catalogInstallmentOnly, setCatalogInstallmentOnly] = useState(
    () => initialCatalogQuery?.installmentOnly ?? false,
  );
  const [catalogSaleOnly, setCatalogSaleOnly] = useState(
    () => initialCatalogQuery?.saleOnly ?? false,
  );
  const [categoryDisplays, setCategoryDisplays] = useState(
    /** @type {import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[]} */ ([]),
  );
  const [categoryDisplaysStatus, setCategoryDisplaysStatus] = useState({
    kind: "idle",
    message: "",
  });

  const catalogFetchSeq = useRef(0);
  const catalogPageRef = useRef(0);
  const catalogSentinelRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [catalogHasMore, setCatalogHasMore] = useState(false);
  const [isCatalogLoadingMore, setIsCatalogLoadingMore] = useState(false);
  const [catalogLoadMoreError, setCatalogLoadMoreError] = useState(
    /** @type {string | null} */ (null),
  );

  const debouncedProductSearchTerm = useDebouncedValue(
    productSearchTerm,
    PRODUCT_SEARCH_UI.DEBOUNCE_MS,
  );

  const catalogQueryFromUrl = useMemo(
    () =>
      parseCatalogQueryFromSearchParams(
        new URLSearchParams(location.search),
      ),
    [location.search],
  );

  const isProductSearchPending =
    productSearchTerm !== debouncedProductSearchTerm;
  const hasProductSearchQuery = debouncedProductSearchTerm.trim() !== "";
  const isMyProductsRoute = isMyProductsMainView(mainView);
  const isMineMode = isMyProductsRoute || isProfileMyProductsTab;
  const activeCatalogBrowserCategory =
    mainView === "catalog-browser" ? catalogQueryFromUrl.category : null;
  const isCatalogBrowserLanding =
    isCatalogBrowserMainViewActive &&
    isCatalogBrowserLandingSearch(location.search, hasProductSearchQuery);
  const isCatalogBrowserProductsView =
    isCatalogBrowserMainViewActive && !isCatalogBrowserLanding;
  const isCatalogProductsView =
    isCatalogShellView || isCatalogBrowserProductsView;

  const handleCatalogSortChange = useCallback(
    (value) => {
      if (catalogAuctionOnly && value === CATALOG_SORT_VIEWS) {
        setCatalogAuctionOnly(false);
      }
      setCatalogSort(value);
    },
    [catalogAuctionOnly],
  );

  const handleShowHiddenCatalogProductsToggle = useCallback(() => {
    setShowHiddenCatalogProducts((prev) => !prev);
  }, []);

  const handleCatalogFollowingOnlyToggle = useCallback(() => {
    if (!isAuthorized) {
      setIsLoginModalOpen(true);
      return;
    }
    setCatalogFollowingOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogAuctionOnly(false);
      }
      return next;
    });
  }, [isAuthorized, setIsLoginModalOpen]);

  const handleCatalogAuctionOnlyToggle = useCallback(() => {
    setCatalogAuctionOnly((prev) => {
      const next = !prev;
      if (next) {
        setCatalogFollowingOnly(false);
        setCatalogSort((currentSort) =>
          currentSort === CATALOG_SORT_VIEWS
            ? CATALOG_SORT_NEWEST
            : currentSort,
        );
      }
      return next;
    });
  }, []);

  const handleCatalogSaleOnlyToggle = useCallback(() => {
    setCatalogSaleOnly((prev) => !prev);
  }, []);

  const handleCatalogInstallmentOnlyToggle = useCallback(() => {
    setCatalogInstallmentOnly((prev) => !prev);
  }, []);

  useEffect(() => {
    if (mainView !== "catalog") {
      return;
    }
    const params = new URLSearchParams(location.search);
    if (!params.has(CATALOG_QUERY_PARAM_CATEGORY)) {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(params);
    const built = buildCatalogSearchParams(parsed);
    const search = built.toString();
    navigate(
      `${mainViewToPathname("catalog-browser")}${search ? `?${search}` : ""}`,
      { replace: true },
    );
  }, [mainView, location.search, navigate]);

  useEffect(() => {
    if (mainView !== "catalog" && mainView !== "catalog-browser") {
      return;
    }
    const parsed = parseCatalogQueryFromSearchParams(
      new URLSearchParams(location.search),
    );
    setCatalogSort((prev) => (prev === parsed.sort ? prev : parsed.sort));
    if (mainView === "catalog-browser") {
      setSelectedProductCategory((prev) =>
        prev === parsed.category ? prev : parsed.category,
      );
    } else {
      setSelectedProductCategory(null);
    }
    setCatalogFollowingOnly((prev) =>
      prev === parsed.followingOnly ? prev : parsed.followingOnly,
    );
    setCatalogAuctionOnly((prev) =>
      prev === parsed.auctionOnly ? prev : parsed.auctionOnly,
    );
    setCatalogInstallmentOnly((prev) =>
      prev === parsed.installmentOnly ? prev : parsed.installmentOnly,
    );
    setCatalogSaleOnly((prev) =>
      prev === parsed.saleOnly ? prev : parsed.saleOnly,
    );
  }, [location.search, mainView]);

  useEffect(() => {
    if (mainView !== "catalog" && mainView !== "catalog-browser") {
      return;
    }
    const built = buildCatalogSearchParams({
      sort: catalogSort,
      category:
        mainView === "catalog-browser" ? selectedProductCategory : null,
      followingOnly: catalogFollowingOnly,
      auctionOnly: catalogAuctionOnly,
      installmentOnly: catalogInstallmentOnly,
      saleOnly: catalogSaleOnly,
    });
    const current = new URLSearchParams(location.search);
    if (areCatalogSearchParamsEqual(built, current)) {
      return;
    }
    const search = built.toString();
    navigate(
      {
        pathname: mainViewToPathname(mainView),
        search: search ? `?${search}` : "",
      },
      { replace: true },
    );
  }, [
    mainView,
    catalogSort,
    selectedProductCategory,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    navigate,
    location.search,
  ]);

  const refreshCategoryDisplays = useCallback(async () => {
    if (!isCatalogBrowserMainViewActive) {
      return;
    }
    setCategoryDisplaysStatus({ kind: "loading", message: "" });
    try {
      const { displays } = await fetchProductCategoryDisplays();
      setCategoryDisplays(displays);
      setCategoryDisplaysStatus({ kind: "idle", message: "" });
    } catch (error) {
      setCategoryDisplaysStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK,
      });
    }
  }, [isCatalogBrowserMainViewActive]);

  useEffect(() => {
    void refreshCategoryDisplays();
  }, [refreshCategoryDisplays]);

  useEffect(() => {
    if (!isMineMode) {
      setMyProductsModerationFilter(MY_PRODUCTS_MODERATION_FILTER_ALL);
    }
  }, [isMineMode, setMyProductsModerationFilter]);

  useEffect(() => {
    if (
      isMineMode &&
      (catalogSort === CATALOG_SORT_PREMIUM ||
        catalogSort === CATALOG_SORT_CONFIRMED)
    ) {
      setCatalogSort(CATALOG_SORT_NEWEST);
    }
  }, [isMineMode, catalogSort]);

  useEffect(() => {
    if (!canModerateProducts) {
      setShowHiddenCatalogProducts(false);
    }
  }, [canModerateProducts]);

  const loadCatalogPage = useCallback(
    async (pageNum) => {
      const search = debouncedProductSearchTerm.trim();
      const productCategory = isMineMode
        ? selectedProductCategory ?? undefined
        : isCatalogBrowserMainViewActive
          ? activeCatalogBrowserCategory ?? undefined
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
        sort: catalogQueryFromUrl.sort,
        includeHidden:
          canModerateProducts && !isMineMode && showHiddenCatalogProducts,
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
      const { products: pageProducts, pagination } =
        await loadCatalogPage(nextPage);
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

  useEffect(() => {
    if (!isCatalogProductsView) {
      return undefined;
    }
    if (catalogStatus.kind !== "idle") {
      return undefined;
    }
    if (!catalogHasMore || catalogLoadMoreError) {
      return undefined;
    }

    const el = catalogSentinelRef.current;
    if (!el) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (!hit) {
          return;
        }
        void loadNextCatalogPage();
      },
      { root: null, rootMargin: "200px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    isCatalogProductsView,
    catalogStatus.kind,
    catalogHasMore,
    catalogLoadMoreError,
    loadNextCatalogPage,
  ]);

  const handleRetryCatalogLoadMore = useCallback(() => {
    setCatalogLoadMoreError(null);
    void loadNextCatalogPage();
  }, [loadNextCatalogPage]);

  const handleProductCategorySelect = useCallback(
    (category) => {
      setSelectedProductCategory(category);
      setIsProductCategoryListOpen(false);
    },
    [setIsProductCategoryListOpen],
  );

  const handleNavigateToFullCatalogFromBreadcrumb = useCallback(() => {
    setMyProductsCatalogError("");
    setSelectedProductCategory(null);
    setIsProductCategoryListOpen(false);
    setCatalogSort(CATALOG_SORT_NEWEST);
    setCatalogFollowingOnly(false);
    setCatalogAuctionOnly(false);
    setCatalogSaleOnly(false);
    navigate(mainViewToPathname("catalog"), { replace: true });
  }, [navigate, setIsProductCategoryListOpen, setMyProductsCatalogError]);

  const handleCatalogMenuClick = useCallback(() => {
    setIsProductCategoryListOpen(false);
    navigate(mainViewToPathname("catalog-browser"), { replace: true });
  }, [navigate, setIsProductCategoryListOpen]);

  const handleCatalogCategoryGridClick = useCallback(
    (categorySlug) => {
      navigate(
        buildCatalogBrowserLocation({
          sort: CATALOG_SORT_NEWEST,
          category: categorySlug,
          followingOnly: false,
          auctionOnly: false,
          installmentOnly: false,
          saleOnly: false,
        }),
      );
    },
    [navigate],
  );

  const handleCatalogFeedTileClick = useCallback(
    (tile) => {
      const nextQuery = buildQueryForCatalogFeedTile(tile);
      if (nextQuery.followingOnly && !isAuthorized) {
        setIsLoginModalOpen(true);
        return;
      }
      navigate(buildCatalogBrowserLocation(nextQuery));
    },
    [isAuthorized, navigate, setIsLoginModalOpen],
  );

  const handleBackToCatalogLanding = useCallback(() => {
    navigate(mainViewToPathname("catalog-browser"));
  }, [navigate]);

  const handleCategoryDisplaySaved = useCallback((display) => {
    setCategoryDisplays((prev) => {
      const next = prev.filter(
        (row) => row.categorySlug !== display.categorySlug,
      );
      return [...next, display];
    });
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    if (!activeCatalogBrowserCategory) {
      return null;
    }
    return resolveProductCategoryDisplay(
      activeCatalogBrowserCategory,
      new Map(categoryDisplays.map((row) => [row.categorySlug, row])),
    ).label;
  }, [activeCatalogBrowserCategory, categoryDisplays]);

  const activeCatalogFeedLabel = useMemo(() => {
    if (!isCatalogBrowserProductsView || activeCatalogBrowserCategory) {
      return null;
    }
    return resolveActiveCatalogFeedLabel(catalogQueryFromUrl);
  }, [
    isCatalogBrowserProductsView,
    activeCatalogBrowserCategory,
    catalogQueryFromUrl,
  ]);

  const resetCatalogFollowingOnLogout = useCallback(() => {
    setCatalogFollowingOnly(false);
  }, []);

  return {
    selectedProductCategory,
    setSelectedProductCategory,
    catalogSort,
    setCatalogSort,
    showHiddenCatalogProducts,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    categoryDisplays,
    categoryDisplaysStatus,
    catalogSentinelRef,
    catalogHasMore,
    isCatalogLoadingMore,
    catalogLoadMoreError,
    debouncedProductSearchTerm,
    isProductSearchPending,
    hasProductSearchQuery,
    isMineMode,
    activeCatalogBrowserCategory,
    isCatalogBrowserLanding,
    isCatalogBrowserProductsView,
    isCatalogProductsView,
    handleCatalogSortChange,
    handleShowHiddenCatalogProductsToggle,
    handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle,
    handleRetryCatalogLoadMore,
    handleProductCategorySelect,
    handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick,
    handleCatalogCategoryGridClick,
    handleCatalogFeedTileClick,
    handleBackToCatalogLanding,
    handleCategoryDisplaySaved,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    resetCatalogFollowingOnLogout,
  };
};
