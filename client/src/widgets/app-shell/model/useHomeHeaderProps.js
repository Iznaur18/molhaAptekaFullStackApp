import { useCallback, useMemo } from "react";

import { isCatalogHeaderMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { useAppShellStateContext } from "./AppShellStateContext.jsx";

export const useHomeHeaderProps = () => {
  const ctx = useAppShellStateContext();
  const {
    mainView,
    catalogMainView,
    showHomeCatalogFeed,
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
    submitProductSearch,
    isProductSearchPending,
    isAuthorized,
    goToMainView,
    handleProductCategorySelect,
    handlePlaceProductClick,
    pendingModerationCount,
    pendingInstallmentDisputesCount,
    pendingProductReportsCount,
    pendingDataConfirmationCount,
    handleNotificationsClick,
    inAppNotifications,
    setIsLoginModalOpen,
    setIsRegisterModalOpen,
    handleNavigateToFullCatalogFromBreadcrumb,
    closeCatalogProductDetails,
    viewerRegionCode,
    setViewerRegionCode,
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
    // С профиля/рекламы — явный уход на `/`, затем сброс фильтров ленты.
    if (mainView !== "catalog") {
      goToMainView("catalog");
    }
    handleNavigateToFullCatalogFromBreadcrumb();
  }, [
    closeCatalogProductDetails,
    goToMainView,
    handleNavigateToFullCatalogFromBreadcrumb,
    mainView,
  ]);

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

  // Ввод только пишется в поле: ни запроса, ни перехода в каталог до «Найти».
  const handleProductSearchSubmit = useCallback(() => {
    submitProductSearch();
    if (productSearchTerm.trim() !== "" && !isCatalogHeaderMainView(mainView)) {
      handleNavigateToFullCatalogFromBreadcrumb();
    }
  }, [
    mainView,
    productSearchTerm,
    submitProductSearch,
    handleNavigateToFullCatalogFromBreadcrumb,
  ]);

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
      onProductSearchSubmit: handleProductSearchSubmit,
      onPlaceProductClick: handleMobilePlaceProductClick,
      pendingModerationCount,
      pendingInstallmentDisputesCount,
      pendingProductReportsCount,
      pendingDataConfirmationCount,
      onMyProfileClick: handleMyProfileClick,
      onNotificationsClick: handleNotificationsClick,
      unreadNotificationsCount:
        mainView === "notifications" ? 0 : inAppNotificationsCount,
      onLoginClick: handleLoginClick,
      onRegisterClick: handleRegisterClick,
      onNavigateToFullCatalogFromBreadcrumb: handleMobileHomeClick,
      showSiteHeaderBanner: Boolean(showHomeCatalogFeed) && mainView === "catalog",
      isCatalogBrowserLanding,
      viewerRegionCode,
      onViewerRegionChange: setViewerRegionCode,
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
      handleProductSearchSubmit,
      closeCatalogProductDetails,
      pendingModerationCount,
      pendingInstallmentDisputesCount,
      pendingProductReportsCount,
      pendingDataConfirmationCount,
      handleMyProfileClick,
      handleNotificationsClick,
      inAppNotificationsCount,
      handleLoginClick,
      handleRegisterClick,
      showHomeCatalogFeed,
      viewerRegionCode,
      setViewerRegionCode,
    ],
  );
};
