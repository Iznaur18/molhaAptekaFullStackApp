import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { productCategoryDisplayQueryKeys } from "../../../entities/product-category-display/model/productCategoryDisplayQueryKeys.js";
import { useProductCatalogFeedTileDisplaysQuery } from "../../../entities/product-category-display/model/useProductCatalogFeedTileDisplaysQuery.js";
import { useProductCategoryDisplaysQuery } from "../../../entities/product-category-display/model/useProductCategoryDisplaysQuery.js";
import { buildCatalogBrowserLocation } from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import { resolveProductCategoryDisplay } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { findCategoryRootIdForLegacySlug } from "../../../entities/product-category-tree/lib/findCategoryRootIdForLegacySlug.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { useProductCategoryBreadcrumbQuery } from "../../../entities/product-category-tree/model/useProductCategoryBreadcrumbQuery.js";
import { useProductCategoryRootsQuery } from "../../../entities/product-category-tree/model/useProductCategoryRootsQuery.js";
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
  const queryClient = useQueryClient();
  const categoryRootsRef = useRef(
    /** @type {import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode[]} */ ([]),
  );

  const displaysEnabled = isCatalogBrowserMainViewActive;
  const rootsEnabled = isCatalogBrowserMainViewActive;
  const breadcrumbEnabled =
    IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED &&
    Boolean(activeCatalogBrowserCategoryId);

  const categoryDisplaysQuery = useProductCategoryDisplaysQuery({
    enabled: displaysEnabled,
  });
  const feedTileDisplaysQuery = useProductCatalogFeedTileDisplaysQuery({
    enabled: displaysEnabled,
  });
  const categoryRootsQuery = useProductCategoryRootsQuery({ enabled: rootsEnabled });
  const breadcrumbQuery = useProductCategoryBreadcrumbQuery({
    categoryId: activeCatalogBrowserCategoryId,
    enabled: breadcrumbEnabled,
  });

  const categoryDisplays = categoryDisplaysQuery.data ?? [];
  const feedTileDisplays = feedTileDisplaysQuery.data ?? [];

  const categoryDisplaysStatus = useMemo(() => {
    const isLoading =
      displaysEnabled &&
      (categoryDisplaysQuery.isPending || feedTileDisplaysQuery.isPending);
    if (isLoading) {
      return { kind: "loading", message: "" };
    }

    const queryError = categoryDisplaysQuery.error ?? feedTileDisplaysQuery.error;
    if (queryError instanceof Error) {
      return { kind: "error", message: queryError.message };
    }
    if (queryError) {
      return {
        kind: "error",
        message: API_CLIENT_UI.FETCH_CATEGORY_DISPLAYS_FALLBACK,
      };
    }

    return { kind: "idle", message: "" };
  }, [
    categoryDisplaysQuery.error,
    categoryDisplaysQuery.isPending,
    displaysEnabled,
    feedTileDisplaysQuery.error,
    feedTileDisplaysQuery.isPending,
  ]);

  useEffect(() => {
    categoryRootsRef.current = categoryRootsQuery.data ?? [];
  }, [categoryRootsQuery.data]);

  useEffect(() => {
    if (!breadcrumbEnabled) {
      setCategoryTreeLabel(null);
      return;
    }

    const breadcrumb = breadcrumbQuery.data;
    if (!breadcrumb) {
      if (breadcrumbQuery.isError) {
        setCategoryTreeLabel(null);
      }
      return;
    }

    const label = breadcrumb.items.map((item) => item.labelRu).join(" › ");
    setCategoryTreeLabel(label || breadcrumb.labelRu);
  }, [
    breadcrumbEnabled,
    breadcrumbQuery.data,
    breadcrumbQuery.isError,
    setCategoryTreeLabel,
  ]);

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
    navigate(buildCatalogBrowserLocation(CATALOG_LANDING_QUERY), { replace: true });
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
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
    navigate(buildCatalogBrowserLocation(CATALOG_LANDING_QUERY), { replace: true });
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
  }, [applyCatalogQueryState, navigate]);

  const handleCategoryDisplaySaved = useCallback(
    (display) => {
      queryClient.setQueryData(productCategoryDisplayQueryKeys.categories(), (old) => {
        const displays = old?.displays ?? [];
        const next = displays.filter((row) => row.categorySlug !== display.categorySlug);
        return { displays: [...next, display] };
      });
    },
    [queryClient],
  );

  const handleFeedTileDisplaySaved = useCallback(
    (display) => {
      queryClient.setQueryData(productCategoryDisplayQueryKeys.feedTiles(), (old) => {
        const displays = old?.displays ?? [];
        const next = displays.filter((row) => row.tileKey !== display.tileKey);
        return { displays: [...next, display] };
      });
    },
    [queryClient],
  );

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
