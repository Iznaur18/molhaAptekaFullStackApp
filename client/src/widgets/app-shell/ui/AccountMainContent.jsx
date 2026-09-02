import { Navigate } from "react-router-dom";

import { AUTH_UI, HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { AUTH_LOGIN_PATH } from "../../../shared/lib/authPaths.js";
import { isRoleRestrictedMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { isStaffMainViewAllowed } from "../../../shared/lib/staffMainViews.js";
import { IS_ONEC_INTEGRATION_ENABLED } from "../../../pages/onec-integration/model/isOneCIntegrationEnabled.js";
import {
  LazyMyProfilePage,
  LazyNotificationsPage,
  LazyUsersPage,
} from "../lib/lazyAppShellPages.js";
import { isProfileTabMainView } from "../lib/profileTabToMainView.js";
import { renderProfileTabPanel } from "../lib/renderProfileTabPanel.jsx";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.myProductsCatalogSection]
 * @param {import('../../my-products-catalog-toolbar/ui/MyProductsCatalogToolbar.jsx').MyProductsCatalogToolbar extends (props: infer P) => unknown ? P : never} [props.myProductsCatalogToolbarProps]
 */
export function AccountMainContent({
  isAuthorized,
  isSessionReady,
  mainView,
  activeProfileTab,
  currentUserId,
  isPremiumUser = false,
  isAdmin,
  canModerateProducts,
  myProfilePage,
  notificationsPageItems,
  unreadNotificationsCount = 0,
  pendingRafflesCount,
  pendingModerationCount,
  pendingIntroAdModerationCount,
  pendingSellerPersonalCategoryModerationCount,
  pendingIncomingPriceOffersCount,
  pendingMySalesActionCount,
  pendingMyOrdersActionCount,
  pendingInstallmentBuyerActionCount,
  pendingInstallmentSellerActionCount,
  pendingInstallmentDisputesCount,
  pendingProductReportsCount,
  pendingProductPromotionsCount,
  pendingDataConfirmationCount,
  onRequestLogin,
  onSellerNameClick,
  onCatalogProductClick,
  setMyProfileTab,
  handleLogout,
  onEditProfileClick,
  onEditProfileCancel,
  onEditProfileSaved,
  handleMyProductsFromProfile,
  handleMySalesFromProfile,
  handleInstallmentPaymentsFromProfile,
  handleInstallmentSalesFromProfile,
  handleInstallmentDisputesFromProfile,
  handleMyOrdersFromProfile,
  handleAuctionFromProfile,
  handleAdminOrdersFromProfile,
  handleSearchSynonymsAdminFromProfile,
  handleCategoryTreeAdminFromProfile,
  handleAppIntroAdminFromProfile,
  handleSiteHeaderBannerAdminFromProfile,
  handlePopularProductsAdminFromProfile,
  handleProductModerationFromProfile,
  handleProductReportsFromProfile,
  handleProductPromotionsFromProfile,
  handleRafflesFromProfile,
  onCreateRaffleClick,
  handleCourierFromProfile,
  handleCourierModerationFromProfile,
  handleShipmentDisputesFromProfile,
  handleShippingCarriersFromProfile,
  handleCourierOverviewFromProfile,
  handleDataConfirmationQueueFromProfile,
  handleDataConfirmationFromProfile,
  setIsDataConfirmationModalOpen,
  handlePremiumFromProfile,
  handlePremiumPurchased,
  handleLoyaltyPointsFromProfile,
  handlePartnerProgramFromProfile,
  handleAdvertisingFromProfile,
  handleOneCIntegrationFromProfile,
  handleIntroAdModerationFromProfile,
  handleSellerPersonalCategoryModerationFromProfile,
  handleSubscriptionsFromProfile,
  handleWishlistFromProfile,
  refreshUserProfileActionBadgeCounts,
  refreshPendingModerationCount,
  refreshPendingIntroAdModerationCount,
  refreshPendingSellerPersonalCategoryModerationCount,
  refreshPendingProductReportsCount,
  refreshPendingProductPromotionsCount,
  refreshPendingRafflesCount,
  refreshPendingDataConfirmationCount,
  refreshPendingInstallmentDisputesCount,
  refreshRaffleSurfaces,
  refreshCatalogFeed,
  setRaffleModal,
  setLoyaltyPoints,
  handleInAppNotificationClick,
  handleNotificationsCleared,
  onOpenProductDetails,
  myProductsCatalogSection = null,
  myProductsCatalogToolbarProps = null,
}) {
  if (isAuthorized && !isSessionReady && isRoleRestrictedMainView(mainView)) {
    return <p className="app-shell__state">{HOME_PAGE_UI.LOADING_SESSION}</p>;
  }

  if (isProfileTabMainView(mainView)) {
    if (!isSessionReady && mainView === "my-profile") {
      return <p className="app-shell__state">{AUTH_UI.SESSION_CHECK}</p>;
    }

    if (
      isSessionReady &&
      !isStaffMainViewAllowed(mainView, { isAdmin, canModerateProducts })
    ) {
      return <Navigate to="/" replace />;
    }

    const profileTabPanelProps = {
      isAuthorized,
      currentUserId,
      isPremiumUser,
      isAdmin,
      onRequestLogin,
      onSellerNameClick,
      onCatalogProductClick,
      onOpenProductDetails,
      refreshUserProfileActionBadgeCounts,
      myProfilePage,
      handlePremiumPurchased,
      setIsDataConfirmationModalOpen,
      myProductsCatalogSection,
      refreshPendingModerationCount,
      refreshPendingIntroAdModerationCount,
      refreshPendingSellerPersonalCategoryModerationCount,
      refreshPendingProductReportsCount,
      refreshPendingProductPromotionsCount,
      refreshPendingRafflesCount,
      refreshPendingDataConfirmationCount,
      refreshPendingInstallmentDisputesCount,
      refreshRaffleSurfaces,
      refreshCatalogFeed,
      setRaffleModal,
      onLoyaltyPointsBalanceChange: setLoyaltyPoints,
      canModerateProducts,
      onEditProfileCancel,
      onEditProfileSaved,
    };

    const tabContent =
      mainView === "my-profile"
        ? null
        : renderProfileTabPanel(mainView, profileTabPanelProps);

    return (
      <LazyMyProfilePage
        user={myProfilePage.phase === "success" ? myProfilePage.user : null}
        isLoading={myProfilePage.phase === "loading"}
        errorMessage={myProfilePage.phase === "error" ? myProfilePage.error : null}
        onLogout={handleLogout}
        onEditProfileClick={onEditProfileClick}
        onMyProductsClick={handleMyProductsFromProfile}
        onMySalesClick={handleMySalesFromProfile}
        onInstallmentPaymentsClick={
          isAuthorized ? handleInstallmentPaymentsFromProfile : undefined
        }
        onInstallmentSalesClick={
          isAuthorized ? handleInstallmentSalesFromProfile : undefined
        }
        onInstallmentDisputesClick={
          canModerateProducts ? handleInstallmentDisputesFromProfile : undefined
        }
        onMyOrdersClick={handleMyOrdersFromProfile}
        onAuctionClick={isAuthorized ? handleAuctionFromProfile : undefined}
        onAdminOrdersClick={isAdmin ? handleAdminOrdersFromProfile : undefined}
        onSearchSynonymsAdminClick={
          isAdmin ? handleSearchSynonymsAdminFromProfile : undefined
        }
        onCategoryTreeAdminClick={
          isAdmin ? handleCategoryTreeAdminFromProfile : undefined
        }
        onAppIntroAdminClick={
          isAdmin ? handleAppIntroAdminFromProfile : undefined
        }
        onSiteHeaderBannerAdminClick={
          canModerateProducts ? handleSiteHeaderBannerAdminFromProfile : undefined
        }
        onPopularProductsAdminClick={
          isAdmin ? handlePopularProductsAdminFromProfile : undefined
        }
        onProductModerationClick={
          canModerateProducts ? handleProductModerationFromProfile : undefined
        }
        onProductReportsClick={
          canModerateProducts ? handleProductReportsFromProfile : undefined
        }
        onProductPromotionsClick={
          canModerateProducts ? handleProductPromotionsFromProfile : undefined
        }
        onRafflesClick={canModerateProducts ? handleRafflesFromProfile : undefined}
        onCreateRaffleClick={onCreateRaffleClick}
        onCourierClick={isAuthorized ? handleCourierFromProfile : undefined}
        onCourierOverviewClick={
          isAuthorized ? handleCourierOverviewFromProfile : undefined
        }
        onCourierModerationClick={
          canModerateProducts ? handleCourierModerationFromProfile : undefined
        }
        onShipmentDisputesClick={
          canModerateProducts ? handleShipmentDisputesFromProfile : undefined
        }
        onShippingCarriersClick={
          isAdmin ? handleShippingCarriersFromProfile : undefined
        }
        onDataConfirmationQueueClick={
          canModerateProducts ? handleDataConfirmationQueueFromProfile : undefined
        }
        onDataConfirmationClick={
          isAuthorized ? handleDataConfirmationFromProfile : undefined
        }
        onPremiumClick={isAuthorized ? handlePremiumFromProfile : undefined}
        onLoyaltyPointsClick={isAuthorized ? handleLoyaltyPointsFromProfile : undefined}
        onPartnerProgramClick={isAuthorized ? handlePartnerProgramFromProfile : undefined}
        onAdvertisingClick={isAuthorized ? handleAdvertisingFromProfile : undefined}
        onOneCIntegrationClick={
          IS_ONEC_INTEGRATION_ENABLED && isAuthorized
            ? handleOneCIntegrationFromProfile
            : undefined
        }
        onIntroAdModerationClick={
          canModerateProducts ? handleIntroAdModerationFromProfile : undefined
        }
        onSellerPersonalCategoryModerationClick={
          canModerateProducts
            ? handleSellerPersonalCategoryModerationFromProfile
            : undefined
        }
        onSubscriptionsClick={isAuthorized ? handleSubscriptionsFromProfile : undefined}
        onWishlistClick={isAuthorized ? handleWishlistFromProfile : undefined}
        pendingModerationCount={pendingModerationCount}
        pendingIntroAdModerationCount={pendingIntroAdModerationCount}
        pendingSellerPersonalCategoryModerationCount={
          pendingSellerPersonalCategoryModerationCount
        }
        pendingIncomingPriceOffersCount={pendingIncomingPriceOffersCount}
        pendingMySalesActionCount={pendingMySalesActionCount}
        pendingMyOrdersActionCount={pendingMyOrdersActionCount}
        pendingInstallmentBuyerActionCount={pendingInstallmentBuyerActionCount}
        pendingInstallmentSellerActionCount={pendingInstallmentSellerActionCount}
        pendingInstallmentDisputesCount={pendingInstallmentDisputesCount}
        pendingProductReportsCount={pendingProductReportsCount}
        pendingProductPromotionsCount={pendingProductPromotionsCount}
        pendingRafflesCount={pendingRafflesCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        unreadNotificationsCount={unreadNotificationsCount}
        activeTab={activeProfileTab}
        onTabChange={setMyProfileTab}
        tabContent={tabContent}
        myProductsCatalogToolbarProps={myProductsCatalogToolbarProps}
      />
    );
  }

  if (mainView === "users") {
    return (
      <LazyUsersPage
        onUserRowClick={onSellerNameClick}
        isAdminViewer={isAdmin}
        isAuthorized={isAuthorized}
      />
    );
  }

  if (mainView === "notifications") {
    if (!isAuthorized) {
      return <Navigate to={AUTH_LOGIN_PATH} replace />;
    }
    return (
      <LazyNotificationsPage
        notifications={notificationsPageItems}
        onNotificationClick={handleInAppNotificationClick}
        onCleared={handleNotificationsCleared}
      />
    );
  }

  return <Navigate to="/" replace />;
}
