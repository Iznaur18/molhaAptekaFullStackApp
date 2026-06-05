import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchProductCategoryBreadcrumb } from "../../../entities/product-category-tree/api/fetchProductCategoryBreadcrumb.js";
import { fetchProductCategoryRoots } from "../../../entities/product-category-tree/api/fetchProductCategoryRoots.js";
import { findCategoryRootIdForLegacySlug } from "../../../entities/product-category-tree/lib/findCategoryRootIdForLegacySlug.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { fetchProductCatalogFeedTileDisplays } from "../../../entities/product-category-display/api/fetchProductCatalogFeedTileDisplays.js";
import { fetchProductCategoryDisplays } from "../../../entities/product-category-display/api/fetchProductCategoryDisplays.js";
import { buildCatalogBrowserLocation } from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import { resolveProductCategoryDisplay } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { catalogMainViewToPathname } from "../../../shared/lib/catalogMainViewPaths.js";
import { CATALOG_LANDING_QUERY } from "./catalogLoaderConstants.js";

/**
 * @param {object} params
 */
export function useCatalogBrowserLanding({
  navigate,
  isCatalogBrowserMainViewActive,
  isCatalogBrowserProductsView,
  activeCatalogBrowserCategory,
  activeCatalogBrowserCategoryId,
  categoryTreeLabel,
  catalogQueryFromUrl,
  catalogSort,
  catalogFollowingOnly,
  catalogAuctionOnly,
  catalogInstallmentOnly,
  catalogSaleOnly,
  isAuthorized,
  setIsLoginModalOpen,
  applyCatalogQueryState,
  setCategoryTreeLabel,
  setMyProductsCatalogError,
  setIsProductCategoryListOpen,
  setProductSearchTerm,
}) {
  const categoryRootsRef = useRef(
    /** @type {import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode[]} */ ([]),
  );
  const [categoryDisplays, setCategoryDisplays] = useState(
    /** @type {import('../../../entities/product-category-display/model/types.js').ProductCategoryDisplayFromApi[]} */ ([]),
  );
  const [feedTileDisplays, setFeedTileDisplays] = useState(
    /** @type {import('../../../entities/product-category-display/model/types.js').ProductCatalogFeedTileDisplayFromApi[]} */ ([]),
  );
  const [categoryDisplaysStatus, setCategoryDisplaysStatus] = useState({
    kind: "idle",
    message: "",
  });

  const refreshCategoryDisplays = useCallback(async () => {
    if (!isCatalogBrowserMainViewActive) {
      return;
    }
    setCategoryDisplaysStatus({ kind: "loading", message: "" });
    try {
      const [{ displays }, { displays: feedDisplays }] = await Promise.all([
        fetchProductCategoryDisplays(),
        fetchProductCatalogFeedTileDisplays(),
      ]);
      setCategoryDisplays(displays);
      setFeedTileDisplays(feedDisplays);
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
    if (!isCatalogBrowserMainViewActive) {
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { categories } = await fetchProductCategoryRoots();
        if (!cancelled) {
          categoryRootsRef.current = categories;
        }
      } catch {
        if (!cancelled) {
          categoryRootsRef.current = [];
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isCatalogBrowserMainViewActive]);

  useEffect(() => {
    if (
      !IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED ||
      !activeCatalogBrowserCategoryId
    ) {
      setCategoryTreeLabel(null);
      return undefined;
    }

    let cancelled = false;

    void (async () => {
      try {
        const { breadcrumb } = await fetchProductCategoryBreadcrumb(
          activeCatalogBrowserCategoryId,
        );
        if (cancelled) {
          return;
        }
        const label = breadcrumb.items.map((item) => item.labelRu).join(" › ");
        setCategoryTreeLabel(label || breadcrumb.labelRu);
      } catch {
        if (!cancelled) {
          setCategoryTreeLabel(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeCatalogBrowserCategoryId, setCategoryTreeLabel]);

  const handleNavigateToFullCatalogFromBreadcrumb = useCallback(() => {
    setMyProductsCatalogError("");
    setIsProductCategoryListOpen(false);
    setProductSearchTerm("");
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
    navigate(
      { pathname: catalogMainViewToPathname("catalog"), search: "" },
      { replace: true },
    );
  }, [
    applyCatalogQueryState,
    navigate,
    setIsProductCategoryListOpen,
    setMyProductsCatalogError,
    setProductSearchTerm,
  ]);

  const handleCatalogMenuClick = useCallback(() => {
    setIsProductCategoryListOpen(false);
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
    navigate(catalogMainViewToPathname("catalog-browser"), { replace: true });
  }, [applyCatalogQueryState, navigate, setIsProductCategoryListOpen]);

  const handleCatalogCategoryGridClick = useCallback(
    (categorySlug) => {
      const rootId = IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED
        ? findCategoryRootIdForLegacySlug(categoryRootsRef.current, categorySlug)
        : null;
      const nextQuery = {
        sort: CATALOG_SORT_NEWEST,
        category: rootId ? null : categorySlug,
        categoryId: rootId,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
      };
      applyCatalogQueryState(nextQuery);
      if (rootId) {
        setCategoryTreeLabel(null);
      }
      navigate(buildCatalogBrowserLocation(nextQuery));
    },
    [applyCatalogQueryState, navigate, setCategoryTreeLabel],
  );

  const handleCatalogCategoryTreeSelect = useCallback(
    ({ categoryId, categoryLabel }) => {
      const nextQuery = {
        sort: catalogSort,
        category: null,
        categoryId,
        followingOnly: catalogFollowingOnly,
        auctionOnly: catalogAuctionOnly,
        installmentOnly: catalogInstallmentOnly,
        saleOnly: catalogSaleOnly,
      };
      setCategoryTreeLabel(categoryLabel);
      applyCatalogQueryState(nextQuery);
      navigate(buildCatalogBrowserLocation(nextQuery, { omitDefaultSort: false }));
    },
    [
      applyCatalogQueryState,
      catalogAuctionOnly,
      catalogFollowingOnly,
      catalogInstallmentOnly,
      catalogSaleOnly,
      catalogSort,
      navigate,
      setCategoryTreeLabel,
    ],
  );

  const handleClearCatalogCategoryTreeFilter = useCallback(() => {
    const nextQuery = {
      sort: catalogSort,
      category: null,
      categoryId: null,
      followingOnly: catalogFollowingOnly,
      auctionOnly: catalogAuctionOnly,
      installmentOnly: catalogInstallmentOnly,
      saleOnly: catalogSaleOnly,
    };
    applyCatalogQueryState(nextQuery);
    navigate(buildCatalogBrowserLocation(nextQuery, { omitDefaultSort: false }));
  }, [
    applyCatalogQueryState,
    catalogAuctionOnly,
    catalogFollowingOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    catalogSort,
    navigate,
  ]);

  const handleCatalogFeedTileClick = useCallback(
    (tile) => {
      const nextQuery = buildQueryForCatalogFeedTile(tile);
      if (nextQuery.followingOnly && !isAuthorized) {
        setIsLoginModalOpen(true);
        return;
      }
      applyCatalogQueryState(nextQuery);
      navigate(buildCatalogBrowserLocation(nextQuery, { omitDefaultSort: false }));
    },
    [applyCatalogQueryState, isAuthorized, navigate, setIsLoginModalOpen],
  );

  const handleBackToCatalogLanding = useCallback(() => {
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
    navigate(catalogMainViewToPathname("catalog-browser"), { replace: true });
  }, [applyCatalogQueryState, navigate]);

  const handleCategoryDisplaySaved = useCallback((display) => {
    setCategoryDisplays((prev) => {
      const next = prev.filter((row) => row.categorySlug !== display.categorySlug);
      return [...next, display];
    });
  }, []);

  const handleFeedTileDisplaySaved = useCallback((display) => {
    setFeedTileDisplays((prev) => {
      const next = prev.filter((row) => row.tileKey !== display.tileKey);
      return [...next, display];
    });
  }, []);

  const selectedCategoryLabel = useMemo(() => {
    if (activeCatalogBrowserCategoryId && categoryTreeLabel) {
      return categoryTreeLabel;
    }
    if (!activeCatalogBrowserCategory) {
      return null;
    }
    return resolveProductCategoryDisplay(
      activeCatalogBrowserCategory,
      new Map(categoryDisplays.map((row) => [row.categorySlug, row])),
    ).label;
  }, [
    activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId,
    categoryDisplays,
    categoryTreeLabel,
  ]);

  const activeCatalogFeedLabel = useMemo(() => {
    if (
      !isCatalogBrowserProductsView ||
      activeCatalogBrowserCategory ||
      activeCatalogBrowserCategoryId
    ) {
      return null;
    }
    return resolveActiveCatalogFeedLabel(catalogQueryFromUrl);
  }, [
    isCatalogBrowserProductsView,
    activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId,
    catalogQueryFromUrl,
  ]);

  return {
    categoryRootsRef,
    categoryDisplays,
    feedTileDisplays,
    categoryDisplaysStatus,
    handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick,
    handleCatalogCategoryGridClick,
    handleCatalogCategoryTreeSelect,
    handleClearCatalogCategoryTreeFilter,
    handleCatalogFeedTileClick,
    handleBackToCatalogLanding,
    handleCategoryDisplaySaved,
    handleFeedTileDisplaySaved,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
  };
}
