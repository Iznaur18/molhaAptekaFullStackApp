import { useCallback, useMemo } from "react";

import { useAppShellStateContext } from "../../../app/model/AppShellStateContext.jsx";

export const useHomeHeaderProps = () => {
  const ctx = useAppShellStateContext();
  const {
    mainView,
    catalogMainView,
    isMineMode,
    activeCatalogBrowserCategory,
    selectedProductCategory,
    isProductCategoryListOpen,
    setIsProductCategoryListOpen,
    handleCatalogMenuClick,
    isCatalogBrowserLanding,
    productSearchTerm,
    setProductSearchTerm,
    isProductSearchPending,
    isAuthorized,
    goToMainView,
    handleProductCategorySelect,
    handlePlaceProductClick,
    myProductsTotal,
    sellerProductsLimit,
    pendingModerationCount,
    pendingInstallmentModerationCount,
    pendingInstallmentDisputesCount,
    pendingProductReportsCount,
    pendingDataConfirmationCount,
    handleNotificationsClick,
    inAppNotifications,
    setIsLoginModalOpen,
    setIsRegisterModalOpen,
    handleNavigateToFullCatalogFromBreadcrumb,
    catalogSort,
    handleCatalogSortChange,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle,
    handleCatalogInstallmentOnlyToggle,
    handleCatalogSaleOnlyToggle,
    isAdmin,
    canModerateProducts,
    showHiddenCatalogProducts,
    handleShowHiddenCatalogProductsToggle,
    myProductsModerationFilter,
    setMyProductsModerationFilter,
  } = ctx;

  const inAppNotificationsCount = inAppNotifications.length;

  const handleProductCategoryFilterToggle = useCallback(() => {
    setIsProductCategoryListOpen((open) => !open);
  }, [setIsProductCategoryListOpen]);

  const handleCloseProductCategoryFilter = useCallback(() => {
    setIsProductCategoryListOpen(false);
  }, [setIsProductCategoryListOpen]);

  const handleMyProfileClick = useCallback(() => {
    goToMainView("my-profile");
  }, [goToMainView]);

  const handleLoginClick = useCallback(() => {
    setIsLoginModalOpen(true);
  }, [setIsLoginModalOpen]);

  const handleRegisterClick = useCallback(() => {
    setIsRegisterModalOpen(true);
  }, [setIsRegisterModalOpen]);

  return useMemo(
    () => ({
      mainView,
      isMineMode,
      selectedProductCategory:
        catalogMainView === "catalog-browser"
          ? activeCatalogBrowserCategory
          : selectedProductCategory,
      isProductCategoryListOpen,
      onCatalogMenuClick: handleCatalogMenuClick,
      isCatalogMenuActive: isCatalogBrowserLanding,
      productSearchTerm,
      isProductSearchPending,
      isAuthorized,
      onSetMainView: goToMainView,
      onProductCategorySelect: handleProductCategorySelect,
      onProductCategoryFilterToggle: handleProductCategoryFilterToggle,
      onCloseProductCategoryFilter: handleCloseProductCategoryFilter,
      onProductSearchTermChange: setProductSearchTerm,
      onPlaceProductClick: handlePlaceProductClick,
      myProductsTotal,
      sellerProductsLimit,
      pendingModerationCount,
      pendingInstallmentModerationCount,
      pendingInstallmentDisputesCount,
      pendingProductReportsCount,
      pendingDataConfirmationCount,
      onMyProfileClick: handleMyProfileClick,
      onNotificationsClick: handleNotificationsClick,
      unreadNotificationsCount: inAppNotificationsCount,
      onLoginClick: handleLoginClick,
      onRegisterClick: handleRegisterClick,
      onNavigateToFullCatalogFromBreadcrumb: handleNavigateToFullCatalogFromBreadcrumb,
      catalogSort,
      onCatalogSortChange: handleCatalogSortChange,
      catalogFollowingOnly,
      catalogAuctionOnly,
      catalogInstallmentOnly,
      catalogSaleOnly,
      onCatalogFollowingOnlyToggle: handleCatalogFollowingOnlyToggle,
      onCatalogAuctionOnlyToggle: handleCatalogAuctionOnlyToggle,
      onCatalogInstallmentOnlyToggle: handleCatalogInstallmentOnlyToggle,
      onCatalogSaleOnlyToggle: handleCatalogSaleOnlyToggle,
      isAdmin,
      canModerateProducts,
      showHiddenCatalogProducts,
      onShowHiddenCatalogProductsToggle: handleShowHiddenCatalogProductsToggle,
      myProductsModerationFilter,
      onMyProductsModerationFilterChange: setMyProductsModerationFilter,
    }),
    [
      mainView,
      catalogMainView,
      isMineMode,
      activeCatalogBrowserCategory,
      selectedProductCategory,
      isProductCategoryListOpen,
      handleCatalogMenuClick,
      isCatalogBrowserLanding,
      productSearchTerm,
      isProductSearchPending,
      isAuthorized,
      goToMainView,
      handleProductCategorySelect,
      handleProductCategoryFilterToggle,
      handleCloseProductCategoryFilter,
      setProductSearchTerm,
      handlePlaceProductClick,
      myProductsTotal,
      sellerProductsLimit,
      pendingModerationCount,
      pendingInstallmentModerationCount,
      pendingInstallmentDisputesCount,
      pendingProductReportsCount,
      pendingDataConfirmationCount,
      handleMyProfileClick,
      handleNotificationsClick,
      inAppNotificationsCount,
      handleLoginClick,
      handleRegisterClick,
      handleNavigateToFullCatalogFromBreadcrumb,
      catalogSort,
      handleCatalogSortChange,
      catalogFollowingOnly,
      catalogAuctionOnly,
      catalogInstallmentOnly,
      catalogSaleOnly,
      handleCatalogFollowingOnlyToggle,
      handleCatalogAuctionOnlyToggle,
      handleCatalogInstallmentOnlyToggle,
      handleCatalogSaleOnlyToggle,
      isAdmin,
      canModerateProducts,
      showHiddenCatalogProducts,
      handleShowHiddenCatalogProductsToggle,
      myProductsModerationFilter,
      setMyProductsModerationFilter,
    ],
  );
};
