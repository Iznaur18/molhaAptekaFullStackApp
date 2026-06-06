import { useHomeCatalogLoader } from "./useHomeCatalogLoader.js";
import { useHomeCatalogProductDetails } from "./useHomeCatalogProductDetails.js";
import { useEmailVerificationGate } from "./useEmailVerificationGate.js";
import { useHomeLogout } from "./useHomeLogout.js";
import { useHomeMyProfileSession } from "./useHomeMyProfileSession.js";
import { useHomeNotifications } from "./useHomeNotifications.js";
import { useHomeProductActions } from "./useHomeProductActions.js";
import { useHomeProfileNavigation } from "./useHomeProfileNavigation.js";

/**
 * @param {Record<string, unknown>} shell
 * @param {() => Promise<void>} flushRemoteCart
 * @param {import('react-router-dom').Location} location
 * @param {import('react-router-dom').NavigateFunction} navigate
 */
export function useHomePageDomain(shell, flushRemoteCart, location, navigate) {
  const profileNavigation = useHomeProfileNavigation({
    goToMainView: shell.goToMainView,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    myProfilePage: shell.myProfilePage,
    setLoyaltyPoints: shell.setLoyaltyPoints,
    setMyProfilePage: shell.setMyProfilePage,
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
    products: shell.products,
    setProducts: shell.setProducts,
    catalogStatus: shell.catalogStatus,
    setCatalogStatus: shell.setCatalogStatus,
    catalogRefreshTick: shell.catalogRefreshTick,
    myProductsModerationFilter: shell.myProductsModerationFilter,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    setMyProductsTotal: shell.setMyProductsTotal,
    setMyProductsCatalogError: shell.setMyProductsCatalogError,
    setIsProductCategoryListOpen: shell.setIsProductCategoryListOpen,
    setProductSearchTerm: shell.setProductSearchTerm,
    initialCatalogQuery: shell.initialCatalogQuery,
  });

  const productActions = useHomeProductActions({
    goToMainView: shell.goToMainView,
    setMyProductsCatalogNotice: shell.setMyProductsCatalogNotice,
    setMyProductsTotal: shell.setMyProductsTotal,
    setProducts: shell.setProducts,
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
    setCatalogRefreshTick: shell.setCatalogRefreshTick,
    setRaffleRefreshTick: shell.setRaffleRefreshTick,
    refreshFeaturedRaffle: shell.refreshFeaturedRaffle,
    setRaffleParticipationPendingProductId:
      shell.setRaffleParticipationPendingProductId,
  });

  const catalogProductDetailsState = useHomeCatalogProductDetails({
    isAuthorized: shell.isAuthorized,
    currentUserId: shell.currentUserId,
    isAdmin: shell.isAdmin,
    isMineMode: catalogLoader.isMineMode,
    products: shell.products,
    setProducts: shell.setProducts,
    catalogProductDetails: shell.catalogProductDetails,
    setCatalogProductDetails: shell.setCatalogProductDetails,
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
    products: shell.products,
    setCatalogProductDetails: shell.setCatalogProductDetails,
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
    setMyProductsTotal: shell.setMyProductsTotal,
    setMyProductsModerationFilter: shell.setMyProductsModerationFilter,
    resetCatalogFollowingOnLogout: catalogLoader.resetCatalogFollowingOnLogout,
    clearInAppNotifications: notifications.clearInAppNotifications,
    setIsAuthorized: shell.setIsAuthorized,
  });

  const handleLogout = useHomeLogout({
    flushRemoteCart,
    navigate,
    setCurrentUserId: shell.setCurrentUserId,
    setIsAuthorized: shell.setIsAuthorized,
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
    ...emailVerificationGate,
  };
}
