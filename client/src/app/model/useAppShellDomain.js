import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { invalidateCatalogProducts } from "../../entities/product/lib/catalogProductsQueryCache.js";
import { invalidateMyProductsTotal } from "../../entities/product/lib/myProductsTotalQueryCache.js";
import { useHomeCatalogLoader } from "../../pages/home/model/useHomeCatalogLoader.js";
import { useHomeCatalogProductDetails } from "../../pages/home/model/useHomeCatalogProductDetails.js";
import { useEmailVerificationGate } from "../../pages/home/model/useEmailVerificationGate.js";
import { useHomeLogout } from "../../pages/home/model/useHomeLogout.js";
import { useHomeMyProfileSession } from "../../pages/home/model/useHomeMyProfileSession.js";
import { useHomeNotifications } from "../../pages/home/model/useHomeNotifications.js";
import { useHomeProductActions } from "../../pages/home/model/useHomeProductActions.js";
import { useHomeProfileNavigation } from "../../pages/home/model/useHomeProfileNavigation.js";

/**
 * @param {Record<string, unknown>} shell
 * @param {() => Promise<void>} flushRemoteCart
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 */
export function useAppShellDomain(shell, flushRemoteCart, location, navigate) {
  const queryClient = useQueryClient();
  const refreshFeaturedRaffle = shell.refreshFeaturedRaffle;
  const handleUserStoriesRefresh = shell.handleUserStoriesRefresh;

  const refreshCatalogFeed = useCallback(async () => {
    await Promise.all([
      invalidateCatalogProducts(queryClient),
      invalidateMyProductsTotal(queryClient),
    ]);
    await refreshFeaturedRaffle();
    handleUserStoriesRefresh();
  }, [queryClient, refreshFeaturedRaffle, handleUserStoriesRefresh]);

  const profileNavigation = useHomeProfileNavigation({
    goToMainView: shell.goToMainView,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    myProfilePage: shell.myProfilePage,
    setLoyaltyPoints: shell.setLoyaltyPoints,
    invalidateAuthMe: shell.invalidateAuthMe,
  });

  const catalogLoader = useHomeCatalogLoader({
    location,
    navigate,
    catalogMainView: shell.catalogMainView,
    isMyProductsRoute: shell.isMyProductsRoute,
    isHomeCatalogMainView: shell.isHomeCatalogMainView,
    isCatalogBrowserMainViewActive: shell.isCatalogBrowserMainViewActive,
    isCatalogShellView: shell.isCatalogShellView,
    isAuthorized: shell.isAuthorized,
    canModerateProducts: shell.canModerateProducts,
    setIsLoginModalOpen: shell.setIsLoginModalOpen,
    productSearchTerm: shell.productSearchTerm,
    myProductsModerationFilter: shell.myProductsModerationFilter,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setIsProductCategoryListOpen: shell.setIsProductCategoryListOpen,
    setProductSearchTerm: shell.    setProductSearchTerm,
    initialCatalogQuery: shell.initialCatalogQuery,
    onCatalogError: shell.onCatalogError,
  });

  const productActions = useHomeProductActions({
    goToMainView: shell.goToMainView,
    setMyProductsCatalogNotice: shell.setMyProductsCatalogNotice,
    isAtSellerProductsLimit: shell.isAtSellerProductsLimit,
    setIsSellerProductsLimitModalOpen: shell.setIsSellerProductsLimitModalOpen,
    setIsCreateProductModalOpen: shell.setIsCreateProductModalOpen,
    setProductToEdit: shell.setProductToEdit,
    setCatalogProductDetails: shell.setCatalogProductDetails,
    setProductDetailsAdminError: shell.setProductDetailsAdminError,
    catalogProductDetails: shell.catalogProductDetails,
    isMineMode: catalogLoader.isMineMode,
    showHiddenCatalogProducts: catalogLoader.showHiddenCatalogProducts,
    selectedProductCategory: catalogLoader.selectedProductCategory,
    setDeletingProductId: shell.setDeletingProductId,
    setTogglingAvailabilityProductId: shell.setTogglingAvailabilityProductId,
    setTogglingAuctionProductId: shell.setTogglingAuctionProductId,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setPromotionProduct: shell.setPromotionProduct,
    setPromotionConfig: shell.setPromotionConfig,
    setPromotionModalError: shell.setPromotionModalError,
    setIsPromotionSubmitPending: shell.setIsPromotionSubmitPending,
    promotionProduct: shell.promotionProduct,
    setLoyaltyPoints: shell.setLoyaltyPoints,
    refreshCatalogFeed,
    refreshRaffleSurfaces: shell.refreshRaffleSurfaces,
    setRaffleParticipationPendingProductId: shell.setRaffleParticipationPendingProductId,
  });

  const catalogProductDetailsState = useHomeCatalogProductDetails({
    isAuthorized: shell.isAuthorized,
    currentUserId: shell.currentUserId,
    isAdmin: shell.isAdmin,
    isMineMode: catalogLoader.isMineMode,
    products: catalogLoader.products,
    catalogProductDetails: shell.catalogProductDetails,
    setCatalogProductDetails: shell.setCatalogProductDetails,
    setProductDetailsAdminError: shell.setProductDetailsAdminError,
    onBeforeOpenDetails: () => {
      shell.setProductToEdit(null);
      shell.setIsCreateProductModalOpen(false);
    },
  });

  const notifications = useHomeNotifications({
    isAuthorized: shell.isAuthorized,
    mainView: shell.mainView,
    goToMainView: shell.goToMainView,
    setIsLoginModalOpen: shell.setIsLoginModalOpen,
    handleSellerNameClick: shell.handleSellerNameClick,
    products: catalogLoader.products,
    setCatalogProductDetails: shell.setCatalogProductDetails,
    inAppNotifications: shell.inAppNotifications,
    invalidateAuthMe: shell.invalidateAuthMe,
    patchAuthMeNotifications: shell.patchAuthMeNotifications,
  });

  useHomeMyProfileSession({
    isAuthorized: shell.isAuthorized,
    isSessionReady: shell.isSessionReady,
    mainView: shell.mainView,
    isAdmin: shell.isAdmin,
    canModerateProducts: shell.canModerateProducts,
    goToMainView: shell.goToMainView,
    setMyProfilePage: shell.setMyProfilePage,
    setIsLoginModalOpen: shell.setIsLoginModalOpen,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    resetCatalogFollowingOnLogout: catalogLoader.resetCatalogFollowingOnLogout,
    clearInAppNotifications: notifications.clearInAppNotifications,
    authUser: shell.authUser,
  });

  const handleLogout = useHomeLogout({
    flushRemoteCart,
    navigate,
    clearAuthSession: shell.clearAuthSession,
    setMyProfilePage: shell.setMyProfilePage,
    setIsEditProfileOpen: shell.setIsEditProfileOpen,
    clearInAppNotifications: notifications.clearInAppNotifications,
  });

  const emailVerificationGate = useEmailVerificationGate({
    isAuthorized: shell.isAuthorized,
    isSessionReady: shell.isSessionReady,
    isEmailVerified: shell.isEmailVerified,
    handleLogout,
  });

  return {
    ...profileNavigation,
    ...catalogLoader,
    ...productActions,
    ...catalogProductDetailsState,
    ...notifications,
    handleLogout,
    refreshCatalogFeed,
    ...emailVerificationGate,
  };
}
