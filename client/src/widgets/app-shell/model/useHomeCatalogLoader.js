import { useCallback } from "react";

import { useCatalogBrowserLanding } from "./useCatalogBrowserLanding.js";
import { useCatalogFilterState } from "./useCatalogFilterState.js";
import { useCatalogQuerySync } from "./useCatalogQuerySync.js";
import { useCatalogProductsInfiniteQuery } from "../../../entities/product/model/useCatalogProductsInfiniteQuery.js";
import { CATALOG_QUERY_PARAM_ALL_CITIES } from "../../../entities/product/lib/catalogCatalogQuery.js";

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
  myProductsModerationFilter,
  setMyProductsModerationFilter,
  setMyProductsCatalogError,
  setIsProductCategoryListOpen,
  setProductSearchTerm,
  initialCatalogQuery,
  onCatalogError,
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
    isAuthorized,
    setIsLoginModalOpen,
    applyCatalogQueryState: filters.applyCatalogQueryState,
    setCategoryTreeLabel: filters.setCategoryTreeLabel,
    setMyProductsCatalogError,
    setIsProductCategoryListOpen,
    setProductSearchTerm,
    onCatalogError,
  });

  useCatalogQuerySync({
    catalogMainView,
    location,
    navigate,
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

  const catalogQuery = useCatalogProductsInfiniteQuery({
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
  });

  const handleProductCategorySelect = useCallback(
    (category) => {
      filters.setSelectedProductCategory(category);
      setIsProductCategoryListOpen(false);
    },
    [filters.setSelectedProductCategory, setIsProductCategoryListOpen],
  );

  const handleShowAllCatalogCities = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.set(CATALOG_QUERY_PARAM_ALL_CITIES, "true");
    navigate(
      {
        pathname: location.pathname,
        search: `?${params.toString()}`,
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate]);

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
    handleRetryCatalogLoadMore: catalogQuery.handleRetryCatalogLoadMore,
    handleProductCategorySelect,
    handleNavigateToFullCatalogFromBreadcrumb:
      browser.handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick: browser.handleCatalogMenuClick,
    handleCatalogCategoryGridClick: browser.handleCatalogCategoryGridClick,
    handleSellerPersonalCategoryTileClick: browser.handleSellerPersonalCategoryTileClick,
    personalCategoryTiles: browser.personalCategoryTiles,
    handleCatalogFeedTileClick: browser.handleCatalogFeedTileClick,
    handleBackToCatalogLanding: browser.handleBackToCatalogLanding,
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
    catalogAllCities: filters.catalogQueryFromUrl.allCities,
    handleShowAllCatalogCities,
  };
};
