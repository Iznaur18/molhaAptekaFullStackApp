import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { productCategoryDisplayQueryKeys } from "../../../entities/product-category-display/model/productCategoryDisplayQueryKeys.js";
import { mergeProductCategoryDisplayIntoList } from "../../../entities/product-category-display/lib/mergeProductCategoryDisplayIntoList.js";
import { invalidateAllProductCategoryDisplayQueries } from "../../../entities/product-category-display/lib/productCategoryDisplayQueryCache.js";
import { useProductCatalogFeedTileDisplaysQuery } from "../../../entities/product-category-display/model/useProductCatalogFeedTileDisplaysQuery.js";
import { useProductCategoryDisplaysQuery } from "../../../entities/product-category-display/model/useProductCategoryDisplaysQuery.js";
import {
  buildCatalogBrowserLocation,
  buildCatalogProductsLocation,
} from "../../../entities/product-category-display/lib/catalogBrowserPaths.js";
import { buildQueryForCatalogFeedTile } from "../../../entities/product-category-display/lib/buildQueryForCatalogFeedTile.js";
import { resolveActiveCatalogFeedLabel } from "../../../entities/product-category-display/lib/resolveActiveCatalogFeedLabel.js";
import { resolveCatalogBreadcrumbCategoryId } from "../../../entities/product-category-display/lib/resolveCatalogBreadcrumbCategoryId.js";
import { resolveProductCategoryDisplay } from "../../../entities/product-category-display/lib/resolveProductCategoryDisplay.js";
import { IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED } from "../../../entities/product-category-tree/lib/isCatalogBrowserSubcategoryFilterEnabled.js";
import { useProductCategoryBreadcrumbQuery } from "../../../entities/product-category-tree/model/useProductCategoryBreadcrumbQuery.js";
import { useProductCategoryRootsQuery } from "../../../entities/product-category-tree/model/useProductCategoryRootsQuery.js";
import { useSellerPersonalCategoryCatalogTilesQuery } from "../../../entities/seller-personal-category/model/useSellerPersonalCategoryCatalogTilesQuery.js";
import { userHasCatalogNearGeo } from "../../../entities/product/lib/userHasCatalogNearGeo.js";
import { API_CLIENT_UI, HOME_PAGE_UI, PRODUCT_CATEGORY_TREE_UI } from "../../../shared/config/appUiCopy.js";
import { catalogMainViewToPathname } from "../../../shared/lib/catalogMainViewPaths.js";
import { mainViewToPathname } from "../../../shared/lib/homeMainViewPaths.js";
import { buildSellerProductsPath } from "../../../shared/lib/sellerPaths.js";
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
  catalogRentalOnly,
  catalogAffiliateOnly,
  catalogWholesaleOnly,
  catalogOriginalOnly,
  authUser = null,
  isAuthorized,
  setIsLoginModalOpen,
  applyCatalogQueryState,
  setCategoryTreeLabel,
  setMyProductsCatalogError,
  setIsProductCategoryListOpen,
  setProductSearchTerm,
  onCatalogError,
  viewerRegionCode,
}) {
  const queryClient = useQueryClient();
  const categoryRootsRef = useRef(
    /** @type {import('../../../entities/product-category-tree/model/types.js').ProductCategoryNode[]} */ ([]),
  );

  const displaysEnabled = isCatalogBrowserMainViewActive;
  const rootsEnabled =
    isCatalogBrowserMainViewActive ||
    (IS_CATALOG_BROWSER_SUBCATEGORY_FILTER_ENABLED &&
      Boolean(activeCatalogBrowserCategoryId));
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
    regionCode: viewerRegionCode,
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

  const handleCatalogBreadcrumbItemClick = useCallback(
    async (item, index = 0) => {
      const breadcrumbItems = breadcrumbQuery.data?.items ?? [];
      const trail =
        breadcrumbItems.length > 0
          ? breadcrumbItems
          : String(categoryTreeLabel ?? "")
              .split(" › ")
              .map((labelRu) => ({ labelRu: labelRu.trim() }))
              .filter((row) => row.labelRu);

      let categoryId = String(item?.categoryId ?? "").trim();
      if (!categoryId) {
        categoryId =
          (await resolveCatalogBreadcrumbCategoryId({
            trail,
            index,
            roots: categoryRootsRef.current,
            fetchChildren: subcategoryPicker.fetchCategoryChildren,
          })) ?? "";
      }

      if (!categoryId) {
        onCatalogError(PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR);
        return;
      }

      const clickedIndex =
        index >= 0
          ? index
          : trail.findIndex((row) => String(row.categoryId ?? "") === categoryId);
      const trailSteps =
        clickedIndex >= 0
          ? trail.slice(0, clickedIndex + 1).map((row, stepIndex) => ({
              id:
                String(row.categoryId ?? "").trim() ||
                (stepIndex === clickedIndex ? categoryId : ""),
              labelRu: String(row.labelRu ?? "").trim(),
            }))
          : [
              {
                id: categoryId,
                labelRu: String(item?.labelRu ?? "").trim(),
              },
            ];

      const normalizedTrail = [];
      for (let stepIndex = 0; stepIndex < trailSteps.length; stepIndex += 1) {
        const step = trailSteps[stepIndex];
        let stepId = String(step.id ?? "").trim();
        if (!stepId) {
          stepId =
            (await resolveCatalogBreadcrumbCategoryId({
              trail,
              index: stepIndex,
              roots: categoryRootsRef.current,
              fetchChildren: subcategoryPicker.fetchCategoryChildren,
            })) ?? "";
        }
        if (!stepId || !step.labelRu) {
          continue;
        }
        normalizedTrail.push({ id: stepId, labelRu: step.labelRu });
      }

      setMyProductsCatalogError("");
      setIsProductCategoryListOpen(false);
      setProductSearchTerm("");

      try {
        const children = await subcategoryPicker.fetchCategoryChildren(categoryId);
        if (children.length > 0) {
          applyCatalogQueryState(CATALOG_LANDING_QUERY);
          navigate(
            isCompactLayout
              ? { pathname: catalogMainViewToPathname("catalog"), search: "" }
              : buildCatalogBrowserLocation(CATALOG_LANDING_QUERY),
            { replace: true },
          );
          subcategoryPicker.openPickerTrail(
            normalizedTrail.length > 0
              ? normalizedTrail
              : [{ id: categoryId, labelRu: String(item?.labelRu ?? "").trim() }],
          );
          return;
        }
      } catch (error) {
        onCatalogError(
          error instanceof Error ? error.message : PRODUCT_CATEGORY_TREE_UI.LOAD_ERROR,
        );
        return;
      }

      subcategoryPicker.navigateToCategoryProducts(categoryId);
    },
    [
      applyCatalogQueryState,
      breadcrumbQuery.data?.items,
      categoryTreeLabel,
      isCompactLayout,
      navigate,
      onCatalogError,
      setIsProductCategoryListOpen,
      setMyProductsCatalogError,
      setProductSearchTerm,
      subcategoryPicker.fetchCategoryChildren,
      subcategoryPicker.navigateToCategoryProducts,
      subcategoryPicker.openPickerTrail,
    ],
  );

  const catalogBreadcrumbItems = breadcrumbQuery.data?.items ?? null;

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

  const handleCatalogCategoryGridClick =
    subcategoryPicker.handleCatalogCategoryGridClick;

  const handleSellerPersonalCategoryTileClick = useCallback(
    (tile) => {
      const sellerId = tile.sellerId?.trim();
      if (!sellerId) {
        return;
      }
      subcategoryPicker.clearPickerTrail();
      navigate(buildSellerProductsPath(sellerId));
    },
    [navigate, subcategoryPicker.clearPickerTrail],
  );

  const handleCatalogFeedTileClick = useCallback(
    (tile) => {
      const nextQuery = buildQueryForCatalogFeedTile(tile);
      if (nextQuery.followingOnly && !isAuthorized) {
        setIsLoginModalOpen(true);
        return;
      }
      if (nextQuery.near) {
        if (!isAuthorized) {
          setIsLoginModalOpen(true);
          return;
        }
        if (!userHasCatalogNearGeo(authUser)) {
          const openProfile = window.confirm(
            `${HOME_PAGE_UI.NEAR_ADDRESS_REQUIRED}\n\n${HOME_PAGE_UI.NEAR_ADDRESS_REQUIRED_CONFIRM}`,
          );
          if (openProfile) {
            navigate(mainViewToPathname("edit-profile"));
          }
          return;
        }
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
      authUser,
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
        return {
          displays: mergeProductCategoryDisplayIntoList(displays, display),
        };
      });
      void invalidateAllProductCategoryDisplayQueries(queryClient);
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
    handleCatalogBreadcrumbItemClick,
    catalogBreadcrumbItems,
    handleCatalogMenuClick,
    handleCatalogCategoryGridClick,
    handleSellerPersonalCategoryTileClick,
    personalCategoryTiles,
    handleCatalogFeedTileClick,
    handleCategoryDisplaySaved,
    handleFeedTileDisplaySaved,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    isCatalogSubcategoryPickerActive:
      subcategoryPicker.isCatalogSubcategoryPickerActive,
    subcategoryPickerTrail: subcategoryPicker.pickerTrail,
    subcategoryPickerLoadError: subcategoryPicker.pickerLoadError,
    resolvingLandingCategoryKey: subcategoryPicker.resolvingLandingCategoryKey,
    resolvingPickerCategoryId: subcategoryPicker.resolvingPickerCategoryId,
    handleSubcategoryPickerBack: subcategoryPicker.handleSubcategoryPickerBack,
    handleSubcategoryPickerViewAll: subcategoryPicker.handleSubcategoryPickerViewAll,
    handleSubcategoryPickerCategoryClick:
      subcategoryPicker.handleSubcategoryPickerCategoryClick,
  };
}
