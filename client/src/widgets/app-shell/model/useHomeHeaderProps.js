import { useCallback, useMemo } from "react";

import { isCatalogHeaderMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { useAppShellStateContext } from "./AppShellStateContext.jsx";

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
    canModerateProducts,
    showHiddenCatalogProducts,
    handleShowHiddenCatalogProductsToggle,
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

  const handleProductSearchTermChange = useCallback(
    (next) => {
      setProductSearchTerm(next);
      if (next.trim() !== "" && !isCatalogHeaderMainView(mainView)) {
        handleNavigateToFullCatalogFromBreadcrumb();
      }
    },
    [mainView, setProductSearchTerm, handleNavigateToFullCatalogFromBreadcrumb],
  );

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
      onProductSearchTermChange: handleProductSearchTermChange,
      onPlaceProductClick: handleMobilePlaceProductClick,
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
      canModerateProducts,
      showHiddenCatalogProducts,
      onShowHiddenCatalogProductsToggle: handleShowHiddenCatalogProductsToggle,
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
      handleProductSearchTermChange,
      closeCatalogProductDetails,
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
      canModerateProducts,
      showHiddenCatalogProducts,
      handleShowHiddenCatalogProductsToggle,
    ],
  );
};
