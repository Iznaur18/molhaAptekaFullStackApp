import { useCallback } from "react";

import { useCatalogBrowserLanding } from "./useCatalogBrowserLanding.js";
import { useCatalogFilterState } from "./useCatalogFilterState.js";
import { useCatalogProductsFetch } from "./useCatalogProductsFetch.js";
import { useCatalogQuerySync } from "./useCatalogQuerySync.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

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
  setProductSearchTerm,
  initialCatalogQuery,
}) => {
  const filters = useCatalogFilterState({
    location,
    catalogMainView,
    isMyProductsRoute,
    isCatalogBrowserMainViewActive,
    isCatalogShellView,
    productSearchTerm,
    initialCatalogQuery,
    isAuthorized,
    setIsLoginModalOpen,
    canModerateProducts,
    setMyProductsModerationFilter,
  });

  const browser = useCatalogBrowserLanding({
    navigate,
    isCatalogBrowserMainViewActive,
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
    isAuthorized,
    setIsLoginModalOpen,
    applyCatalogQueryState: filters.applyCatalogQueryState,
    setCategoryTreeLabel: filters.setCategoryTreeLabel,
    setMyProductsCatalogError,
    setIsProductCategoryListOpen,
    setProductSearchTerm,
  });

  useCatalogQuerySync({
    catalogMainView,
    location,
    navigate,
    hasProductSearchQuery: filters.hasProductSearchQuery,
    catalogSort: filters.catalogSort,
    selectedProductCategory: filters.selectedProductCategory,
    selectedCategoryId: filters.selectedCategoryId,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogInstallmentOnly: filters.catalogInstallmentOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    catalogQueryFromUrl: filters.catalogQueryFromUrl,
    setCatalogSort: filters.setCatalogSort,
    setSelectedProductCategory: filters.setSelectedProductCategory,
    setSelectedCategoryId: filters.setSelectedCategoryId,
    setCategoryTreeLabel: filters.setCategoryTreeLabel,
    setCatalogFollowingOnly: filters.setCatalogFollowingOnly,
    setCatalogAuctionOnly: filters.setCatalogAuctionOnly,
    setCatalogInstallmentOnly: filters.setCatalogInstallmentOnly,
    setCatalogSaleOnly: filters.setCatalogSaleOnly,
    categoryRootsRef: browser.categoryRootsRef,
  });

  const fetch = useCatalogProductsFetch({
    isCatalogProductsView: filters.isCatalogProductsView,
    isMineMode: filters.isMineMode,
    isCatalogBrowserMainViewActive,
    activeCatalogBrowserCategory: filters.activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId: filters.activeCatalogBrowserCategoryId,
    catalogQueryFromUrl: filters.catalogQueryFromUrl,
    debouncedProductSearchTerm: filters.debouncedProductSearchTerm,
    selectedProductCategory: filters.selectedProductCategory,
    catalogSort: filters.catalogSort,
    myProductsModerationFilter,
    canModerateProducts,
    showHiddenCatalogProducts: filters.showHiddenCatalogProducts,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    catalogRefreshTick,
    products,
    setProducts,
    catalogStatus,
    setCatalogStatus,
    setMyProductsTotal,
  });

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
    showHiddenCatalogProducts: filters.showHiddenCatalogProducts,
    catalogFollowingOnly: filters.catalogFollowingOnly,
    catalogAuctionOnly: filters.catalogAuctionOnly,
    catalogInstallmentOnly: filters.catalogInstallmentOnly,
    catalogSaleOnly: filters.catalogSaleOnly,
    categoryDisplays: browser.categoryDisplays,
    feedTileDisplays: browser.feedTileDisplays,
    categoryDisplaysStatus: browser.categoryDisplaysStatus,
    catalogSentinelRef: fetch.catalogSentinelRef,
    catalogHasMore: fetch.catalogHasMore,
    isCatalogLoadingMore: fetch.isCatalogLoadingMore,
    catalogLoadMoreError: fetch.catalogLoadMoreError,
    debouncedProductSearchTerm: filters.debouncedProductSearchTerm,
    isProductSearchPending: filters.isProductSearchPending,
    hasProductSearchQuery: filters.hasProductSearchQuery,
    isMineMode: filters.isMineMode,
    activeCatalogBrowserCategory: filters.activeCatalogBrowserCategory,
    activeCatalogBrowserCategoryId: filters.activeCatalogBrowserCategoryId,
    selectedCategoryId: filters.selectedCategoryId,
    categoryTreeLabel: filters.categoryTreeLabel,
    isCatalogBrowserLanding: filters.isCatalogBrowserLanding,
    isCatalogBrowserProductsView: filters.isCatalogBrowserProductsView,
    isCatalogProductsView: filters.isCatalogProductsView,
    handleCatalogSortChange: filters.handleCatalogSortChange,
    handleShowHiddenCatalogProductsToggle:
      filters.handleShowHiddenCatalogProductsToggle,
    handleCatalogFollowingOnlyToggle: filters.handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle: filters.handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle: filters.handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle: filters.handleCatalogInstallmentOnlyToggle,
    handleRetryCatalogLoadMore: fetch.handleRetryCatalogLoadMore,
    handleProductCategorySelect,
    handleNavigateToFullCatalogFromBreadcrumb:
      browser.handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick: browser.handleCatalogMenuClick,
    handleCatalogCategoryGridClick: browser.handleCatalogCategoryGridClick,
    handleCatalogCategoryTreeSelect: browser.handleCatalogCategoryTreeSelect,
    handleClearCatalogCategoryTreeFilter: browser.handleClearCatalogCategoryTreeFilter,
    handleCatalogFeedTileClick: browser.handleCatalogFeedTileClick,
    handleBackToCatalogLanding: browser.handleBackToCatalogLanding,
    handleCategoryDisplaySaved: browser.handleCategoryDisplaySaved,
    handleFeedTileDisplaySaved: browser.handleFeedTileDisplaySaved,
    selectedCategoryLabel: browser.selectedCategoryLabel,
    activeCatalogFeedLabel: browser.activeCatalogFeedLabel,
    resetCatalogFollowingOnLogout: filters.resetCatalogFollowingOnLogout,
  };
};
