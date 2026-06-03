import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuthBootstrap } from "./useAuthBootstrap.js";
import { useCurrentUserSession } from "./useCurrentUserSession.js";
import { useHomeCatalogGridProps } from "./useHomeCatalogGridProps.js";
import { useHomeCatalogLoader } from "./useHomeCatalogLoader.js";
import { useHomeCatalogProductDetails } from "./useHomeCatalogProductDetails.js";
import { useHomeEmailVerifiedRedirect } from "./useHomeEmailVerifiedRedirect.js";
import { useHomeFeaturedContent } from "./useHomeFeaturedContent.js";
import { useHomeLogout } from "./useHomeLogout.js";
import { useHomeMainView } from "./useHomeMainView.js";
import { useHomeMyProfileSession } from "./useHomeMyProfileSession.js";
import { useHomeNotifications } from "./useHomeNotifications.js";
import { useHomePagePresentationLayer } from "./useHomePagePresentationLayer.js";
import { useHomeProductActions } from "./useHomeProductActions.js";
import { useHomeProfileNavigation } from "./useHomeProfileNavigation.js";
import { useHomeRouteGuards } from "./useHomeRouteGuards.js";
import { useHomeSellerAccess } from "./useHomeSellerAccess.js";
import { useHomeSellerModal } from "./useHomeSellerModal.jsx";
import { useHomeStaffBadgeCounts } from "./useHomeStaffBadgeCounts.js";
import {
  EMPTY_MY_PROFILE_PAGE,
  readInitialCatalogQuery,
} from "../lib/homePageConstants.js";

import { useCart } from "../../../entities/cart/model/useCart.js";
import { MY_PRODUCTS_MODERATION_FILTER_ALL } from "../../../entities/product/model/productConstants.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

export function useHomePageController() {
  const { flushRemoteCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    mainView,
    goToMainView,
    activeProfileTab,
    raffleRouteId,
    isRaffleRoute,
    isProfileMyProductsTab,
    isHomeCatalogMainView,
    isCatalogBrowserMainViewActive,
    isCatalogShellView,
    setMyProfileTab,
  } = useHomeMainView(location, navigate);

  /** @type {[ProductFromApi[], import('react').Dispatch<import('react').SetStateAction<ProductFromApi[]>>]} */
  const [products, setProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [{ isAuthorized, isAuthReady }, setIsAuthorized] = useAuthBootstrap();
  const [catalogStatus, setCatalogStatus] = useState({ kind: "loading" });
  const [myProfilePage, setMyProfilePage] = useState(EMPTY_MY_PROFILE_PAGE);
  const [isProductCategoryListOpen, setIsProductCategoryListOpen] =
    useState(false);
  const [editingCategorySlug, setEditingCategorySlug] = useState(
    /** @type {import('../../../entities/product/model/types.js').ProductCategory | null} */ (null),
  );
  const initialCatalogQuery = useMemo(() => readInitialCatalogQuery(), []);
  const [myProductsModerationFilter, setMyProductsModerationFilter] =
    useState(MY_PRODUCTS_MODERATION_FILTER_ALL);
  const [myProductsCatalogError, setMyProductsCatalogError] = useState("");
  const [myProductsCatalogNotice, setMyProductsCatalogNotice] = useState("");
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [togglingAvailabilityProductId, setTogglingAvailabilityProductId] =
    useState(null);
  const [togglingAuctionProductId, setTogglingAuctionProductId] =
    useState(null);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [isSellerProductsLimitModalOpen, setIsSellerProductsLimitModalOpen] =
    useState(false);
  /** @type {[import('../../../entities/product/model/types.js').ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<import('../../../entities/product/model/types.js').ProductFromApi | null>>]} */
  const [productToEdit, setProductToEdit] = useState(null);
  const [usersListTick, setUsersListTick] = useState(0);
  const [catalogRefreshTick, setCatalogRefreshTick] = useState(0);
  const {
    currentUserId,
    currentUserRole,
    isPremiumUser,
    isEmailVerified,
    loyaltyPoints,
    loyaltyPointsReserved,
    setLoyaltyPoints,
    setLoyaltyPointsReserved,
    setCurrentUserId,
    setIsPremiumUser,
    setIsEmailVerified,
    isSessionReady,
  } = useCurrentUserSession(isAuthorized, isAuthReady);

  useHomeEmailVerifiedRedirect({
    location,
    navigate,
    isAuthorized,
    setIsEmailVerified,
  });

  const [myProductsTotal, setMyProductsTotal] = useState(
    /** @type {number | null} */ (null),
  );

  const { isAdmin, canModerateProducts, sellerProductsLimit, isAtSellerProductsLimit } =
    useHomeSellerAccess({
      currentUserRole,
      isPremiumUser,
      myProductsTotal,
    });

  useHomeRouteGuards({
    location,
    navigate,
    mainView,
    goToMainView,
    isSessionReady,
    isAdmin,
    canModerateProducts,
  });

  const {
    pendingModerationCount,
    pendingProductReportsCount,
    pendingDataConfirmationCount,
    pendingProductPromotionsCount,
    pendingRafflesCount,
    pendingInstallmentModerationCount,
    pendingInstallmentDisputesCount,
    pendingIncomingPriceOffersCount,
    pendingMySalesActionCount,
    pendingMyOrdersActionCount,
    pendingInstallmentBuyerActionCount,
    pendingInstallmentSellerActionCount,
    refreshPendingModerationCount,
    refreshPendingProductReportsCount,
    refreshPendingDataConfirmationCount,
    refreshPendingProductPromotionsCount,
    refreshPendingRafflesCount,
    refreshPendingInstallmentModerationCount,
    refreshPendingInstallmentDisputesCount,
    refreshUserProfileActionBadgeCounts,
  } = useHomeStaffBadgeCounts({
    isAuthorized,
    canModerateProducts,
    mainView,
  });

  const [isAdminEditUserOpen, setIsAdminEditUserOpen] = useState(false);
  const [isAdminDeleteUserOpen, setIsAdminDeleteUserOpen] = useState(false);

  const {
    sellerModal,
    setSellerModal,
    closeSellerModal,
    handleSellerNameClick,
    renderSellerFollowAccessory,
  } = useHomeSellerModal({
    currentUserId,
    isAuthorized,
    setIsLoginModalOpen,
    setIsAdminEditUserOpen,
    setIsAdminDeleteUserOpen,
  });

  /** @type {[ProductFromApi | null, import('react').Dispatch<import('react').SetStateAction<ProductFromApi | null>>]} */
  const [catalogProductDetails, setCatalogProductDetails] = useState(null);
  const [productDetailsAdminError, setProductDetailsAdminError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [raffleParticipationPendingProductId, setRaffleParticipationPendingProductId] =
    useState(null);
  const [raffleModal, setRaffleModal] = useState(
    /** @type {{ mode: 'create' } | { mode: 'edit', raffle: import('../../../entities/raffle/model/types.js').RaffleFromApi, useStaffApi: boolean } | null} */ (null),
  );
  const [raffleRefreshTick, setRaffleRefreshTick] = useState(0);

  const onCatalogError = useCallback((message) => {
    setCatalogStatus({ kind: "error", message });
  }, []);

  const {
    featuredRaffles,
    featuredRaffleIndex,
    setFeaturedRaffleIndex,
    userStoriesFeed,
    handleUserStoriesRefresh,
    sellerRaffleActive,
    getFeaturedRaffleManage,
    pendingPromotionProductIds,
    refreshFeaturedRaffle,
    refreshSellerRaffleState,
    refreshMyPromotionPendingIds,
  } = useHomeFeaturedContent({
    isHomeCatalogMainView,
    isAuthorized,
    currentUserId,
    canModerateProducts,
    catalogRefreshTick,
    raffleRefreshTick,
    mainView,
    activeProfileTab,
    onCatalogError,
    setRaffleModal,
    setRaffleRefreshTick,
    refreshPendingRafflesCount,
  });

  const [isDataConfirmationModalOpen, setIsDataConfirmationModalOpen] =
    useState(false);
  const [isReportProductModalOpen, setIsReportProductModalOpen] =
    useState(false);
  const [promotionProduct, setPromotionProduct] = useState(
    /** @type {ProductFromApi | null} */ (null),
  );
  const [promotionTariffs, setPromotionTariffs] = useState(
    /** @type {Array<{ code: string; title: string; durationHours: number; priceRub: number }>} */ ([]),
  );
  const [promotionModalError, setPromotionModalError] = useState("");
  const [isPromotionSubmitPending, setIsPromotionSubmitPending] = useState(false);

  const profileNavigation = useHomeProfileNavigation({
    setMyProfileTab,
    setMyProductsCatalogError,
    myProfilePage,
    setIsDataConfirmationModalOpen,
    setLoyaltyPoints,
    setMyProfilePage,
  });

  const {
    handleMyProductsFromProfile,
    handleMyOrdersFromProfile,
    handleMySalesFromProfile,
    handleInstallmentPaymentsFromProfile,
    handleInstallmentSalesFromProfile,
    handleInstallmentModerationFromProfile,
    handleInstallmentDisputesFromProfile,
    handleAdminOrdersFromProfile,
    handleProductModerationFromProfile,
    handleProductReportsFromProfile,
    handleProductPromotionsFromProfile,
    handleRafflesFromProfile,
    handleAuctionFromProfile,
    handleDataConfirmationQueueFromProfile,
    handleDataConfirmationFromProfile,
    handlePremiumFromProfile,
    handleLoyaltyPointsFromProfile,
    handleSubscriptionsFromProfile,
    handlePremiumPurchased,
  } = profileNavigation;

  const {
    selectedProductCategory,
    catalogSort,
    showHiddenCatalogProducts,
    catalogFollowingOnly,
    catalogAuctionOnly,
    catalogInstallmentOnly,
    catalogSaleOnly,
    categoryDisplays,
    categoryDisplaysStatus,
    catalogSentinelRef,
    catalogHasMore,
    isCatalogLoadingMore,
    catalogLoadMoreError,
    isProductSearchPending,
    hasProductSearchQuery,
    isMineMode,
    activeCatalogBrowserCategory,
    isCatalogBrowserLanding,
    handleCatalogSortChange,
    handleShowHiddenCatalogProductsToggle,
    handleCatalogFollowingOnlyToggle,
    handleCatalogAuctionOnlyToggle,
    handleCatalogSaleOnlyToggle,
    handleCatalogInstallmentOnlyToggle,
    handleRetryCatalogLoadMore,
    handleProductCategorySelect,
    handleNavigateToFullCatalogFromBreadcrumb,
    handleCatalogMenuClick,
    handleCatalogCategoryGridClick,
    handleCatalogFeedTileClick,
    handleBackToCatalogLanding,
    handleCategoryDisplaySaved,
    selectedCategoryLabel,
    activeCatalogFeedLabel,
    resetCatalogFollowingOnLogout,
  } = useHomeCatalogLoader({
    location,
    navigate,
    mainView,
    isProfileMyProductsTab,
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
    initialCatalogQuery,
  });

  const productActions = useHomeProductActions({
    goToMainView,
    setMyProductsCatalogNotice,
    setMyProductsTotal,
    setProducts,
    isAtSellerProductsLimit,
    setIsSellerProductsLimitModalOpen,
    setIsCreateProductModalOpen,
    setProductToEdit,
    setCatalogProductDetails,
    setProductDetailsAdminError,
    catalogProductDetails,
    isMineMode,
    showHiddenCatalogProducts,
    selectedProductCategory,
    setDeletingProductId,
    setTogglingAvailabilityProductId,
    setTogglingAuctionProductId,
    setMyProductsCatalogError,
    setPromotionProduct,
    setPromotionTariffs,
    setPromotionModalError,
    setIsPromotionSubmitPending,
    promotionProduct,
    setLoyaltyPoints,
    refreshMyPromotionPendingIds,
    setCatalogRefreshTick,
    setRaffleRefreshTick,
    refreshFeaturedRaffle,
    setRaffleParticipationPendingProductId,
  });

  const {
    handleCreateProductSuccess,
    handlePlaceProductClick,
    handleOpenEditMyProduct,
    handleCloseEditProductModal,
    handleEditProductSuccess,
    handleAdminOpenEditProductFromDetails,
    handleSetMyProductAvailability,
    handleSetProductAuction,
    handleDeleteMyProduct,
    handleOpenPromotionModal,
    handleClosePromotionModal,
    handleSubmitPromotionRequest,
    handleToggleRaffleParticipation,
  } = productActions;

  const {
    catalogProductDetailsTab,
    setCatalogProductDetailsTab,
    catalogProductHasPendingReport,
    setCatalogProductHasPendingReport,
    canReportCatalogProduct,
    showCatalogProductManageFooter,
    catalogDetailsShowAddToCart,
    handleCatalogProductClick,
    handleProductStatsUpdate,
  } = useHomeCatalogProductDetails({
    isAuthorized,
    currentUserId,
    isAdmin,
    isMineMode,
    products,
    setProducts,
    catalogProductDetails,
    setCatalogProductDetails,
  });

  const {
    inAppNotifications,
    notificationsPageItems,
    handleNotificationsClick,
    handleNotificationsCleared,
    handleInAppNotificationClick,
    clearInAppNotifications,
  } = useHomeNotifications({
    isAuthorized,
    mainView,
    goToMainView,
    setIsLoginModalOpen,
    handleSellerNameClick,
    products,
    setCatalogProductDetails,
  });

  useHomeMyProfileSession({
    isAuthorized,
    isSessionReady,
    mainView,
    activeProfileTab,
    isAdmin,
    canModerateProducts,
    goToMainView,
    setMyProfilePage,
    setIsLoginModalOpen,
    setMyProductsCatalogError,
    setMyProductsTotal,
    setMyProductsModerationFilter,
    resetCatalogFollowingOnLogout,
    clearInAppNotifications,
    setMyProfileTab,
  });

  const handleLogout = useHomeLogout({
    flushRemoteCart,
    navigate,
    setCurrentUserId,
    setIsAuthorized,
    setMyProfilePage,
    setIsEditProfileOpen,
    clearInAppNotifications,
  });

  const { headerProps, mainContentProps, modalsLayerProps } =
    useHomePagePresentationLayer({
      catalogStatus,
      products,
      isHomeCatalogMainView,
      featuredRaffles,
      featuredRaffleIndex,
      setFeaturedRaffleIndex,
      getFeaturedRaffleManage,
      userStoriesFeed,
      isAuthorized,
      currentUserId,
      handleUserStoriesRefresh,
      handleSellerNameClick,
      mainView,
      activeCatalogBrowserCategory,
      selectedProductCategory,
      hasProductSearchQuery,
      isMineMode,
      deletingProductId,
      handleDeleteMyProduct,
      handleOpenEditMyProduct,
      handleOpenPromotionModal,
      pendingPromotionProductIds,
      myProductsCatalogError,
      myProductsCatalogNotice,
      setCatalogProductDetails,
      handleSetMyProductAvailability,
      handleSetProductAuction,
      togglingAvailabilityProductId,
      togglingAuctionProductId,
      isPremiumUser,
      loyaltyPoints,
      loyaltyPointsReserved,
      setIsLoginModalOpen,
      catalogSentinelRef,
      catalogHasMore,
      isCatalogLoadingMore,
      catalogLoadMoreError,
      handleRetryCatalogLoadMore,
      myProductsModerationFilter,
      catalogFollowingOnly,
      catalogAuctionOnly,
      catalogInstallmentOnly,
      catalogSaleOnly,
      sellerRaffleActive,
      handleToggleRaffleParticipation,
      raffleParticipationPendingProductId,
      isCatalogBrowserLanding,
      categoryDisplays,
      isAdmin,
      categoryDisplaysStatus,
      handleCatalogFeedTileClick,
      handleCatalogCategoryGridClick,
      setEditingCategorySlug,
      selectedCategoryLabel,
      activeCatalogFeedLabel,
      handleBackToCatalogLanding,
      isProductCategoryListOpen,
      setIsProductCategoryListOpen,
      handleCatalogMenuClick,
      productSearchTerm,
      setProductSearchTerm,
      isProductSearchPending,
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
      setIsRegisterModalOpen,
      handleNavigateToFullCatalogFromBreadcrumb,
      catalogSort,
      handleCatalogSortChange,
      handleCatalogFollowingOnlyToggle,
      handleCatalogAuctionOnlyToggle,
      handleCatalogInstallmentOnlyToggle,
      handleCatalogSaleOnlyToggle,
      canModerateProducts,
      showHiddenCatalogProducts,
      handleShowHiddenCatalogProductsToggle,
      setMyProductsModerationFilter,
      isRaffleRoute,
      raffleRouteId,
      isSessionReady,
      activeProfileTab,
      myProfilePage,
      usersListTick,
      notificationsPageItems,
      raffleRefreshTick,
      pendingRafflesCount,
      pendingIncomingPriceOffersCount,
      pendingMySalesActionCount,
      pendingMyOrdersActionCount,
      pendingInstallmentBuyerActionCount,
      pendingInstallmentSellerActionCount,
      pendingProductPromotionsCount,
      handleCatalogProductClick,
      setMyProfileTab,
      handleLogout,
      setIsEditProfileOpen,
      handleMyProductsFromProfile,
      handleMySalesFromProfile,
      handleInstallmentPaymentsFromProfile,
      handleInstallmentSalesFromProfile,
      handleInstallmentModerationFromProfile,
      handleInstallmentDisputesFromProfile,
      handleMyOrdersFromProfile,
      handleAuctionFromProfile,
      handleAdminOrdersFromProfile,
      handleProductModerationFromProfile,
      handleProductReportsFromProfile,
      handleProductPromotionsFromProfile,
      handleRafflesFromProfile,
      setRaffleModal,
      handleDataConfirmationQueueFromProfile,
      handleDataConfirmationFromProfile,
      handlePremiumFromProfile,
      handlePremiumPurchased,
      handleLoyaltyPointsFromProfile,
      handleSubscriptionsFromProfile,
      refreshUserProfileActionBadgeCounts,
      refreshPendingModerationCount,
      refreshPendingProductReportsCount,
      refreshPendingProductPromotionsCount,
      refreshPendingRafflesCount,
      refreshPendingDataConfirmationCount,
      refreshPendingInstallmentModerationCount,
      refreshPendingInstallmentDisputesCount,
      refreshFeaturedRaffle,
      refreshSellerRaffleState,
      setRaffleRefreshTick,
      setCatalogRefreshTick,
      handleInAppNotificationClick,
      handleNotificationsCleared,
      sellerModal,
      closeSellerModal,
      renderSellerFollowAccessory,
      setIsAdminEditUserOpen,
      setIsAdminDeleteUserOpen,
      setUsersListTick,
      setSellerModal,
      isDataConfirmationModalOpen,
      setIsDataConfirmationModalOpen,
      refreshPendingDataConfirmationCount,
      isEditProfileOpen,
      setMyProfilePage,
      setIsPremiumUser,
      setLoyaltyPoints,
      isAdminEditUserOpen,
      isAdminDeleteUserOpen,
      isLoginModalOpen,
      setIsAuthorized,
      isRegisterModalOpen,
      isSellerProductsLimitModalOpen,
      setIsSellerProductsLimitModalOpen,
      isCreateProductModalOpen,
      setIsCreateProductModalOpen,
      handleCreateProductSuccess,
      productToEdit,
      handleCloseEditProductModal,
      handleEditProductSuccess,
      productDetailsAdminError,
      promotionProduct,
      promotionTariffs,
      promotionModalError,
      isPromotionSubmitPending,
      handleClosePromotionModal,
      handleSubmitPromotionRequest,
      raffleModal,
      setMyProductsCatalogNotice,
      catalogProductDetails,
      setCatalogProductDetailsTab,
      setProductDetailsAdminError,
      handleProductStatsUpdate,
      catalogDetailsShowAddToCart,
      catalogProductDetailsTab,
      canReportCatalogProduct,
      catalogProductHasPendingReport,
      setIsReportProductModalOpen,
      showCatalogProductManageFooter,
      handleAdminOpenEditProductFromDetails,
      isReportProductModalOpen,
      setCatalogProductHasPendingReport,
      editingCategorySlug,
      handleCategoryDisplaySaved,
    });

  return {
    isAuthorized,
    isSessionReady,
    isEmailVerified,
    headerProps,
    mainContentProps,
    modalsLayerProps,
  };
}
