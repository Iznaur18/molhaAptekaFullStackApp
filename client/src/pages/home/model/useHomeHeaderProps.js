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
    isCatalogSubcategoryPickerActive,
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
    closeCatalogProductDetails,
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
    closeCatalogProductDetails();
    goToMainView("my-profile");
  }, [closeCatalogProductDetails, goToMainView]);

  const handleLoginClick = useCallback(() => {
    closeCatalogProductDetails();
    setIsLoginModalOpen(true);
  }, [closeCatalogProductDetails, setIsLoginModalOpen]);

  const handleMobileHomeClick = useCallback(() => {
    closeCatalogProductDetails();
    handleNavigateToFullCatalogFromBreadcrumb();
  }, [closeCatalogProductDetails, handleNavigateToFullCatalogFromBreadcrumb]);

  const handleMobileCatalogClick = useCallback(() => {
    closeCatalogProductDetails();
    handleCatalogMenuClick();
  }, [closeCatalogProductDetails, handleCatalogMenuClick]);

  const handleMobilePlaceProductClick = useCallback(() => {
    closeCatalogProductDetails();
    handlePlaceProductClick();
  }, [closeCatalogProductDetails, handlePlaceProductClick]);

  const handleMobileCartClick = useCallback(() => {
    closeCatalogProductDetails();
    goToMainView("cart");
  }, [closeCatalogProductDetails, goToMainView]);

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
      onCatalogMenuClick: handleMobileCatalogClick,
      onMobileCartClick: handleMobileCartClick,
      isCatalogMenuActive: isCatalogBrowserLanding && !isCatalogSubcategoryPickerActive,
      productSearchTerm,
      isProductSearchPending,
      isAuthorized,
      onSetMainView: goToMainView,
      onProductCategorySelect: handleProductCategorySelect,
      onProductCategoryFilterToggle: handleProductCategoryFilterToggle,
      onCloseProductCategoryFilter: handleCloseProductCategoryFilter,
      onProductSearchTermChange: setProductSearchTerm,
      onPlaceProductClick: handleMobilePlaceProductClick,
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
      onNavigateToFullCatalogFromBreadcrumb: handleMobileHomeClick,
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
      handleMobileCatalogClick,
      handleMobileHomeClick,
      handleMobileCartClick,
      handleMobilePlaceProductClick,
      isCatalogBrowserLanding,
      isCatalogSubcategoryPickerActive,
      productSearchTerm,
      isProductSearchPending,
      isAuthorized,
      goToMainView,
      handleProductCategorySelect,
      handleProductCategoryFilterToggle,
      handleCloseProductCategoryFilter,
      setProductSearchTerm,
      closeCatalogProductDetails,
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
