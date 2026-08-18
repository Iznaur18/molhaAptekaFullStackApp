import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { invalidateCuratedProductLists } from "../../entities/curated-product-list/lib/curatedProductListQueryCache.js";
import { invalidateCatalogProducts } from "../../entities/product/lib/catalogProductsQueryCache.js";
import { invalidateMyProductsTotal } from "../../entities/product/lib/myProductsTotalQueryCache.js";
import { useHomeCatalogLoader } from "../../widgets/app-shell/model/useHomeCatalogLoader.js";
import { useHomeCatalogProductDetails } from "../../widgets/app-shell/model/useHomeCatalogProductDetails.js";
import { useEmailVerificationGate } from "../../widgets/app-shell/model/useEmailVerificationGate.js";
import { useHomeLogout } from "../../widgets/app-shell/model/useHomeLogout.js";
import { useHomeMyProfileSession } from "../../widgets/app-shell/model/useHomeMyProfileSession.js";
import { useHomeNotifications } from "../../widgets/app-shell/model/useHomeNotifications.js";
import { useHomeProductActions } from "../../widgets/app-shell/model/useHomeProductActions.js";
import { useHomeCuratedProductLists } from "../../widgets/app-shell/model/useHomeCuratedProductLists.js";
import { useHomeProfileNavigation } from "../../widgets/app-shell/model/useHomeProfileNavigation.js";

/**
 * @param {Record<string, unknown>} shell
 * @param {() => Promise<void>} flushRemoteCart
 * @param {() => Promise<void>} flushRemoteWishlist
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 */
export function useAppShellDomain(
  shell,
  flushRemoteCart,
  flushRemoteWishlist,
  location,
  navigate,
) {
  const queryClient = useQueryClient();
  const refreshFeaturedRaffle = shell.refreshFeaturedRaffle;
  const handleUserStoriesRefresh = shell.handleUserStoriesRefresh;

  const refreshCatalogFeed = useCallback(async () => {
    await Promise.all([
      invalidateCatalogProducts(queryClient),
      invalidateMyProductsTotal(queryClient),
      invalidateCuratedProductLists(queryClient),
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
    authUser: shell.authUser,
    isAuthorized: shell.isAuthorized,
    setIsLoginModalOpen: shell.setIsLoginModalOpen,
    submittedProductSearchTerm: shell.submittedProductSearchTerm,
    myProductsModerationFilter: shell.myProductsModerationFilter,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setIsProductCategoryListOpen: shell.setIsProductCategoryListOpen,
    setProductSearchTerm: shell.setProductSearchTerm,
    initialCatalogQuery: shell.initialCatalogQuery,
    onCatalogError: shell.onCatalogError,
    viewerRegionCode: shell.viewerRegionCode,
    isSessionReady: shell.isSessionReady,
  });

  const curatedProductListsState = useHomeCuratedProductLists({
    isHomeCatalogMainView: shell.showHomeCatalogFeed ?? shell.isHomeCatalogMainView,
    isMineMode: catalogLoader.isMineMode,
    selectedProductCategory: catalogLoader.selectedProductCategory,
    selectedCategoryId: catalogLoader.selectedCategoryId,
    sellerPersonalCategoryId: catalogLoader.sellerPersonalCategoryId,
    hasProductSearchQuery: catalogLoader.hasProductSearchQuery,
    catalogFollowingOnly: catalogLoader.catalogFollowingOnly,
    catalogAuctionOnly: catalogLoader.catalogAuctionOnly,
    catalogInstallmentOnly: catalogLoader.catalogInstallmentOnly,
    catalogSaleOnly: catalogLoader.catalogSaleOnly,
    catalogRentalOnly: catalogLoader.catalogRentalOnly,
    catalogAffiliateOnly: catalogLoader.catalogAffiliateOnly,
    catalogWholesaleOnly: catalogLoader.catalogWholesaleOnly,
    catalogOriginalOnly: catalogLoader.catalogOriginalOnly,
    catalogNear: catalogLoader.catalogNear,
    viewerRegionCode: shell.viewerRegionCode,
  });

  const productActions = useHomeProductActions({
    goToMainView: shell.goToMainView,
    navigate,
    setMyProductsCatalogNotice: shell.setMyProductsCatalogNotice,
    isAtSellerProductsLimit: shell.isAtSellerProductsLimit,
    setIsSellerProductsLimitModalOpen: shell.setIsSellerProductsLimitModalOpen,
    setIsCreateProductModalOpen: shell.setIsCreateProductModalOpen,
    setProductToEdit: shell.setProductToEdit,
    setProductToCopy: shell.setProductToCopy,
    setProductDetailsAdminError: shell.setProductDetailsAdminError,
    isMineMode: catalogLoader.isMineMode,
    selectedProductCategory: catalogLoader.selectedProductCategory,
    setDeletingProductId: shell.setDeletingProductId,
    setTogglingAvailabilityProductId: shell.setTogglingAvailabilityProductId,
    setTogglingAuctionProductId: shell.setTogglingAuctionProductId,
    setTogglingQaProductId: shell.setTogglingQaProductId,
    setTogglingOriginalityProductId: shell.setTogglingOriginalityProductId,
    setTogglingWholesaleProductId: shell.setTogglingWholesaleProductId,
    setTogglingRentalProductId: shell.setTogglingRentalProductId,
    setTogglingAffiliateProductId: shell.setTogglingAffiliateProductId,
    setTogglingInstallmentProductId: shell.setTogglingInstallmentProductId,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setPromotionProduct: shell.setPromotionProduct,
    setPromotionConfig: shell.setPromotionConfig,
    setPromotionModalError: shell.setPromotionModalError,
    setIsPromotionSubmitPending: shell.setIsPromotionSubmitPending,
    promotionProduct: shell.promotionProduct,
    productToEdit: shell.productToEdit,
    loyaltyPoints: shell.loyaltyPoints,
    loyaltyPointsReserved: shell.loyaltyPointsReserved,
    setLoyaltyPoints: shell.setLoyaltyPoints,
    refreshCatalogFeed,
    refreshRaffleSurfaces: shell.refreshRaffleSurfaces,
    setRaffleParticipationPendingProductId: shell.setRaffleParticipationPendingProductId,
  });

  const catalogProductDetailsState = useHomeCatalogProductDetails({
    onBeforeOpenDetails: () => {
      shell.setProductToEdit(null);
      shell.setProductToCopy(null);
      shell.setIsCreateProductModalOpen(false);
    },
  });

  const notifications = useHomeNotifications({
    isAuthorized: shell.isAuthorized,
    mainView: shell.mainView,
    goToMainView: shell.goToMainView,
    setIsLoginModalOpen: shell.setIsLoginModalOpen,
    handleSellerNameClick: shell.handleSellerNameClick,
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
    navigate,
    setMyProfilePage: shell.setMyProfilePage,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    resetCatalogFollowingOnLogout: catalogLoader.resetCatalogFollowingOnLogout,
    clearInAppNotifications: notifications.clearInAppNotifications,
    authUser: shell.authUser,
  });

  const handleLogout = useHomeLogout({
    flushRemoteCart,
    flushRemoteWishlist,
    navigate,
    clearAuthSession: shell.clearAuthSession,
    setMyProfilePage: shell.setMyProfilePage,
    clearInAppNotifications: notifications.clearInAppNotifications,
  });

  const emailVerificationGate = useEmailVerificationGate({
    isAuthorized: shell.isAuthorized,
    isSessionReady: shell.isSessionReady,
    isEmailVerified: shell.isEmailVerified,
    currentUserEmail: shell.currentUserEmail,
    isPhoneVerified: shell.isPhoneVerified,
    handleLogout,
  });

  return {
    ...profileNavigation,
    ...catalogLoader,
    ...curatedProductListsState,
    ...productActions,
    ...catalogProductDetailsState,
    ...notifications,
    handleLogout,
    refreshCatalogFeed,
    ...emailVerificationGate,
  };
}
