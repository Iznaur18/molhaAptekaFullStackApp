import { useCallback } from "react";

import { useCatalogBrowserLanding } from "./useCatalogBrowserLanding.js";
import { useCatalogFilterState } from "./useCatalogFilterState.js";
import { useCatalogQuerySync } from "./useCatalogQuerySync.js";
import { userHasCatalogNearGeo } from "../../../entities/product/lib/userHasCatalogNearGeo.js";
import { useCatalogProductsInfiniteQuery } from "../../../entities/product/model/useCatalogProductsInfiniteQuery.js";
import { useAppShellCompactLayout } from "../../../shared/lib/useAppShellCompactLayout.js";

/**
 * @param {object} params
 */
export const useHomeCatalogLoader = ({
  location,
  navigate,
  catalogMainView,
  isMyProductsRoute,
  isHomeCatalogMainView,
  isCatalogBrowserMainViewActive,
  isCatalogShellView,
  authUser = null,
  isAuthorized,
  isSessionReady = true,
  setIsLoginModalOpen,
  submittedProductSearchTerm,
  myProductsModerationFilter,
  setMyProductsModerationFilter,
  setMyProductsCatalogError,
  setIsProductCategoryListOpen,
  setProductSearchTerm,
  initialCatalogQuery,
  onCatalogError,
  viewerRegionCode,
}) => {
  const isCompactLayout = useAppShellCompactLayout();
  const nearAllowed =
    isSessionReady && isAuthorized && userHasCatalogNearGeo(authUser);

  const filters = useCatalogFilterState({
    location,
    catalogMainView,
    isMyProductsRoute,
    isCatalogBrowserMainViewActive,
    isCatalogShellView,
    submittedProductSearchTerm,
    initialCatalogQuery,
    authUser,
    isAuthorized,
    isSessionReady,
    setIsLoginModalOpen,
    setMyProductsModerationFilter,
    navigate,
  });

  const browser = useCatalogBrowserLanding({
    navigate,
    isCompactLayout,
    isCatalogBrowserMainViewActive,
    isCatalogBrowserLanding: filters.isCatalogBrowserLanding,
    isCatalogBrowserProductsView: filters.isCatalogBrowserProductsView,
    activeCatalogBrowserCategory: filters.activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId: filters.activeCatalogBrowserCategoryId,
    categoryTreeLabel: filters.categoryTreeLabel,
    catalogQueryFromUrl: filters.catalogQueryFromUrl,
    catalogSort: filters.catalogSort,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogInstallmentOnly: filters.catalogInstallmentOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    authUser,
    isAuthorized,
    setIsLoginModalOpen,
    applyCatalogQueryState: filters.applyCatalogQueryState,
    setCategoryTreeLabel: filters.setCategoryTreeLabel,
    setMyProductsCatalogError,
    setIsProductCategoryListOpen,
    setProductSearchTerm,
    onCatalogError,
    viewerRegionCode,
  });

  useCatalogQuerySync({
    catalogMainView,
    location,
    navigate,
    isCompactLayout,
    catalogSort: filters.catalogSort,
    selectedProductCategory: filters.selectedProductCategory,
    selectedCategoryId: filters.selectedCategoryId,
    sellerPersonalCategoryId: filters.sellerPersonalCategoryId,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogInstallmentOnly: filters.catalogInstallmentOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    catalogNear: filters.catalogNear,
    catalogQueryFromUrl: filters.catalogQueryFromUrl,
    setCatalogSort: filters.setCatalogSort,
    setSelectedProductCategory: filters.setSelectedProductCategory,
    setSelectedCategoryId: filters.setSelectedCategoryId,
    setSellerPersonalCategoryId: filters.setSellerPersonalCategoryId,
    setCategoryTreeLabel: filters.setCategoryTreeLabel,
    setCatalogFollowingOnly: filters.setCatalogFollowingOnly,
    setCatalogAuctionOnly: filters.setCatalogAuctionOnly,
    setCatalogInstallmentOnly: filters.setCatalogInstallmentOnly,
    setCatalogSaleOnly: filters.setCatalogSaleOnly,
    setCatalogNear: filters.setCatalogNear,
    categoryRootsRef: browser.categoryRootsRef,
  });

  const catalogQuery = useCatalogProductsInfiniteQuery({
    isCatalogProductsView: filters.isCatalogProductsView,
    isMineMode: filters.isMineMode,
    isCatalogBrowserMainViewActive,
    activeCatalogBrowserCategory: filters.activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId: filters.activeCatalogBrowserCategoryId,
    catalogQueryFromUrl: filters.catalogQueryFromUrl,
    appliedProductSearchTerm: filters.appliedProductSearchTerm,
    selectedProductCategory: filters.selectedProductCategory,
    catalogSort: filters.catalogSort,
    myProductsModerationFilter,
    viewerRegionCode,
    nearAllowed,
  });

  // Спиннер в поле поиска — про реальную загрузку отправленного запроса
  // (дебаунса, который раньше «висел» между вводом и запросом, больше нет).
  const isProductSearchPending =
    filters.hasProductSearchQuery &&
    catalogQuery.query.isFetching &&
    !catalogQuery.query.isFetchingNextPage;

  const handleProductCategorySelect = useCallback(
    (category) => {
      filters.setSelectedProductCategory(category);
      setIsProductCategoryListOpen(false);
    },
    [filters.setSelectedProductCategory, setIsProductCategoryListOpen],
  );

  return {
    selectedProductCategory: filters.selectedProductCategory,
    setSelectedProductCategory: filters.setSelectedProductCategory,
    catalogSort: filters.catalogSort,
    setCatalogSort: filters.setCatalogSort,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogInstallmentOnly: filters.catalogInstallmentOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    catalogNear: filters.catalogNear,
    categoryRoots: browser.categoryRoots,
    categoryDisplays: browser.categoryDisplays,
    feedTileDisplays: browser.feedTileDisplays,
    categoryDisplaysStatus: browser.categoryDisplaysStatus,
    products: catalogQuery.products,
    catalogStatus: catalogQuery.catalogStatus,
    catalogSentinelRef: catalogQuery.catalogSentinelRef,
    catalogHasMore: catalogQuery.catalogHasMore,
    isCatalogLoadingMore: catalogQuery.isCatalogLoadingMore,
    catalogLoadMoreError: catalogQuery.catalogLoadMoreError,
    appliedProductSearchTerm: filters.appliedProductSearchTerm,
    isProductSearchPending,
    hasProductSearchQuery: filters.hasProductSearchQuery,
    isMineMode: filters.isMineMode,
    activeCatalogBrowserCategory: filters.activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId: filters.activeCatalogBrowserCategoryId,
    selectedCategoryId: filters.selectedCategoryId,
    sellerPersonalCategoryId: filters.sellerPersonalCategoryId,
    categoryTreeLabel: filters.categoryTreeLabel,
    isCatalogBrowserLanding: filters.isCatalogBrowserLanding,
    isCatalogBrowserProductsView: filters.isCatalogBrowserProductsView,
    isCatalogProductsView: filters.isCatalogProductsView,
    handleCatalogSortChange: filters.handleCatalogSortChange,
    handleCatalogFollowingOnlyToggle: filters.handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle: filters.handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle: filters.handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle: filters.handleCatalogInstallmentOnlyToggle,
    handleCatalogNearToggle: filters.handleCatalogNearToggle,
    handleRetryCatalogLoadMore: catalogQuery.handleRetryCatalogLoadMore,
    handleProductCategorySelect,
    handleNavigateToFullCatalogFromBreadcrumb:
      browser.handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick: browser.handleCatalogMenuClick,
    handleCatalogCategoryGridClick: browser.handleCatalogCategoryGridClick,
    handleSellerPersonalCategoryTileClick: browser.handleSellerPersonalCategoryTileClick,
    personalCategoryTiles: browser.personalCategoryTiles,
    handleCatalogFeedTileClick: browser.handleCatalogFeedTileClick,
    handleCategoryDisplaySaved: browser.handleCategoryDisplaySaved,
    handleFeedTileDisplaySaved: browser.handleFeedTileDisplaySaved,
    selectedCategoryLabel: browser.selectedCategoryLabel,
    activeCatalogFeedLabel: browser.activeCatalogFeedLabel,
    isCatalogSubcategoryPickerActive: browser.isCatalogSubcategoryPickerActive,
    subcategoryPickerTrail: browser.subcategoryPickerTrail,
    subcategoryPickerLoadError: browser.subcategoryPickerLoadError,
    resolvingLandingCategoryKey: browser.resolvingLandingCategoryKey,
    resolvingPickerCategoryId: browser.resolvingPickerCategoryId,
    handleSubcategoryPickerBack: browser.handleSubcategoryPickerBack,
    handleSubcategoryPickerViewAll: browser.handleSubcategoryPickerViewAll,
    handleSubcategoryPickerCategoryClick: browser.handleSubcategoryPickerCategoryClick,
    resetCatalogFollowingOnLogout: filters.resetCatalogFollowingOnLogout,
  };
};
