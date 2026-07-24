import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { productCategoryDisplayQueryKeys } from "../../../entities/product-category-display/model/productCategoryDisplayQueryKeys.js";
import { useProductCatalogFeedTileDisplaysQuery } from "../../../entities/product-category-display/model/useProductCatalogFeedTileDisplaysQuery.js";
import { useProductCategoryDisplaysQuery } from "../../../entities/product-category-display/model/useProductCategoryDisplaysQuery.js";
import {
  buildCatalogBrowserLocation,
  buildCatalogProductsLocation,
} from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import { resolveProductCategoryDisplay } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { useProductCategoryBreadcrumbQuery } from "../../../entities/product-category-tree/model/useProductCategoryBreadcrumbQuery.js";
import { useProductCategoryRootsQuery } from "../../../entities/product-category-tree/model/useProductCategoryRootsQuery.js";
import { useSellerPersonalCategoryCatalogTilesQuery } from "../../../entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery.js";
import { CATALOG_SORT_NEWEST } from "../../../entities/product/model/productConstants.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { catalogMainViewToPathname } from "../../../shared/lib/catalogMainViewPaths.js";
import { CATALOG_LANDING_QUERY } from "./catalogLoaderConstants.js";
import { useCatalogSubcategoryPicker } from "./useCatalogSubcategoryPicker.js";

/**
 * @param {object} params
 */
export function useCatalogBrowserLanding({
  navigate,
  isCompactLayout,
  isCatalogBrowserMainViewActive,
  isCatalogBrowserLanding,
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
  onCatalogError,
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
  const personalCategoryTilesQuery = useSellerPersonalCategoryCatalogTilesQuery({
    enabled: displaysEnabled,
  });
  const breadcrumbQuery = useProductCategoryBreadcrumbQuery({
    categoryId: activeCatalogBrowserCategoryId,
    enabled: breadcrumbEnabled,
  });

  const subcategoryPicker = useCatalogSubcategoryPicker({
    isCatalogBrowserLanding,
    isCompactLayout,
    categoryRootsRef,
    applyCatalogQueryState,
    navigate,
    setCategoryTreeLabel,
    onCatalogError,
  });

  const categoryDisplays = categoryDisplaysQuery.data ?? [];
  const feedTileDisplays = feedTileDisplaysQuery.data ?? [];
  const categoryRoots = categoryRootsQuery.data ?? [];
  const personalCategoryTiles = personalCategoryTilesQuery.data ?? [];

  const categoryDisplaysStatus = useMemo(() => {
    const isLoading =
      displaysEnabled &&
      (categoryDisplaysQuery.isPending ||
        feedTileDisplaysQuery.isPending ||
        categoryRootsQuery.isPending ||
        personalCategoryTilesQuery.isPending);
    if (isLoading) {
      return { kind: "loading", message: "" };
    }

    const queryError =
      categoryDisplaysQuery.error ??
      feedTileDisplaysQuery.error ??
      categoryRootsQuery.error ??
      personalCategoryTilesQuery.error;
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
    categoryRootsQuery.error,
    categoryRootsQuery.isPending,
    displaysEnabled,
    feedTileDisplaysQuery.error,
    feedTileDisplaysQuery.isPending,
    personalCategoryTilesQuery.error,
    personalCategoryTilesQuery.isPending,
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
    subcategoryPicker.clearPickerTrail();
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
    subcategoryPicker.clearPickerTrail,
  ]);

  const handleCatalogMenuClick = useCallback(() => {
    setIsProductCategoryListOpen(false);
    subcategoryPicker.clearPickerTrail();
    navigate(buildCatalogBrowserLocation(CATALOG_LANDING_QUERY), { replace: true });
    applyCatalogQueryState(CATALOG_LANDING_QUERY);
  }, [
    applyCatalogQueryState,
    navigate,
    setIsProductCategoryListOpen,
    subcategoryPicker.clearPickerTrail,
  ]);

  const handleCatalogCategoryGridClick = subcategoryPicker.handleCatalogCategoryGridClick;

  const handleSellerPersonalCategoryTileClick = useCallback(
    (tile) => {
      if (!tile._id) {
        return;
      }
      const nextQuery = {
        sort: CATALOG_SORT_NEWEST,
        category: null,
        categoryId: null,
        sellerPersonalCategoryId: tile._id,
        followingOnly: false,
        auctionOnly: false,
        installmentOnly: false,
        saleOnly: false,
      };
      applyCatalogQueryState(nextQuery);
      subcategoryPicker.clearPickerTrail();
      navigate(buildCatalogProductsLocation(nextQuery, { compact: isCompactLayout }));
    },
    [
      applyCatalogQueryState,
      isCompactLayout,
      navigate,
      subcategoryPicker.clearPickerTrail,
    ],
  );

  const handleCatalogFeedTileClick = useCallback(
    (tile) => {
      const nextQuery = buildQueryForCatalogFeedTile(tile);
      if (nextQuery.followingOnly && !isAuthorized) {
        setIsLoginModalOpen(true);
        return;
      }
      applyCatalogQueryState(nextQuery);
      subcategoryPicker.clearPickerTrail();
      navigate(
        buildCatalogProductsLocation(nextQuery, {
          compact: isCompactLayout,
          omitDefaultSort: false,
        }),
      );
    },
    [
      applyCatalogQueryState,
      isAuthorized,
      isCompactLayout,
      navigate,
      setIsLoginModalOpen,
      subcategoryPicker.clearPickerTrail,
    ],
  );


  const handleCategoryDisplaySaved = useCallback(
    (display) => {
      queryClient.setQueryData(productCategoryDisplayQueryKeys.categories(), (old) => {
        const displays = old?.displays ?? [];
        const next = displays.filter(
          (row) =>
            row.categorySlug !== display.categorySlug && row.categoryId !== display.categoryId,
        );
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
    if (catalogQueryFromUrl.sellerPersonalCategoryId) {
      if (categoryTreeLabel) {
        return categoryTreeLabel;
      }
      const tile = personalCategoryTiles.find(
        (item) => item._id === catalogQueryFromUrl.sellerPersonalCategoryId,
      );
      return tile?.labelRu ?? null;
    }
    if (activeCatalogBrowserCategoryId && categoryTreeLabel) {
      return categoryTreeLabel;
    }
    if (activeCatalogBrowserCategoryId) {
      const root = categoryRoots.find(
        (item) => item.id === activeCatalogBrowserCategoryId,
      );
      if (root) {
        return root.labelRu;
      }
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
    catalogQueryFromUrl.sellerPersonalCategoryId,
    categoryDisplays,
    categoryRoots,
    categoryTreeLabel,
    personalCategoryTiles,
  ]);

  const activeCatalogFeedLabel = useMemo(() => {
    if (
      !isCatalogBrowserProductsView ||
      activeCatalogBrowserCategory ||
      activeCatalogBrowserCategoryId ||
      catalogQueryFromUrl.sellerPersonalCategoryId
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
    categoryRoots,
    categoryDisplays,
    feedTileDisplays,
    categoryDisplaysStatus,
    handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick,
    handleCatalogCategoryGridClick,
    handleSellerPersonalCategoryTileClick,
    personalCategoryTiles,
    handleCatalogFeedTileClick,
    handleCategoryDisplaySaved,
    handleFeedTileDisplaySaved,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    isCatalogSubcategoryPickerActive: subcategoryPicker.isCatalogSubcategoryPickerActive,
    subcategoryPickerTrail: subcategoryPicker.pickerTrail,
    subcategoryPickerLoadError: subcategoryPicker.pickerLoadError,
    resolvingLandingCategoryKey: subcategoryPicker.resolvingLandingCategoryKey,
    resolvingPickerCategoryId: subcategoryPicker.resolvingPickerCategoryId,
    handleSubcategoryPickerBack: subcategoryPicker.handleSubcategoryPickerBack,
    handleSubcategoryPickerViewAll: subcategoryPicker.handleSubcategoryPickerViewAll,
    handleSubcategoryPickerCategoryClick: subcategoryPicker.handleSubcategoryPickerCategoryClick,
  };
}
