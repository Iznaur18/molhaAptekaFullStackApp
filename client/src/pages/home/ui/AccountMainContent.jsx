import { RaffleSellerOverview } from "../../../entities/raffle/ui/RaffleSellerOverview.jsx";
import { renderProfileTabPanel } from "../../my-profile/lib/renderProfileTabPanel.jsx";
import { isProfileTabMainView } from "../../my-profile/lib/profileTabToMainView.js";
import {
  LazyMyProfilePage,
  LazyNotificationsPage,
  LazyUsersPage,
} from "../lib/lazyHomePages.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { isRoleRestrictedMainView } from "../../../shared/lib/homeMainViewPaths.js";
import { isStaffMainViewAllowed } from "../../../shared/lib/staffMainViews.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {object} props
 * @param {import('react').ReactNode} [props.myProductsCatalogSection]
 */
export function AccountMainContent({
  isRaffleRoute,
  raffleRouteId,
  isSellerRoute,
  sellerRouteId,
  isAuthorized,
  isSessionReady,
  mainView,
  activeProfileTab,
  currentUserId,
  isAdmin,
  canModerateProducts,
  myProfilePage,
  usersListTick,
  notificationsPageItems,
  raffleRefreshTick,
  pendingRafflesCount,
  pendingModerationCount,
  pendingIncomingPriceOffersCount,
  pendingMySalesActionCount,
  pendingMyOrdersActionCount,
  pendingInstallmentBuyerActionCount,
  pendingInstallmentSellerActionCount,
  pendingInstallmentModerationCount,
  pendingInstallmentDisputesCount,
  pendingProductReportsCount,
  pendingDataConfirmationCount,
  onRequestLogin,
  onSellerNameClick,
  onCatalogProductClick,
  goToMainView,
  setMyProfileTab,
  handleLogout,
  onEditProfileClick,
  handleMyProductsFromProfile,
  handleMySalesFromProfile,
  handleInstallmentPaymentsFromProfile,
  handleInstallmentSalesFromProfile,
  handleInstallmentModerationFromProfile,
  handleInstallmentDisputesFromProfile,
  handleMyOrdersFromProfile,
  handleAuctionFromProfile,
  handleAdminOrdersFromProfile,
  handleSearchSynonymsAdminFromProfile,
  handleCategoryTreeAdminFromProfile,
  handleProductModerationFromProfile,
  handleProductReportsFromProfile,
  handleRafflesFromProfile,
  onCreateRaffleClick,
  handleDataConfirmationQueueFromProfile,
  handleDataConfirmationFromProfile,
  setIsDataConfirmationModalOpen,
  dataConfirmationStatusRefreshTick,
  handlePremiumFromProfile,
  handlePremiumPurchased,
  handleLoyaltyPointsFromProfile,
  handleSubscriptionsFromProfile,
  refreshUserProfileActionBadgeCounts,
  refreshPendingModerationCount,
  refreshPendingProductReportsCount,
  refreshPendingRafflesCount,
  refreshPendingDataConfirmationCount,
  refreshPendingInstallmentModerationCount,
  refreshPendingInstallmentDisputesCount,
  refreshFeaturedRaffle,
  refreshSellerRaffleState,
  setRaffleRefreshTick,
  setCatalogRefreshTick,
  setRaffleModal,
  handleInAppNotificationClick,
  handleNotificationsCleared,
  onOpenProductDetails,
  myProductsCatalogSection = null,
}) {
  if (isAuthorized && !isSessionReady && isRoleRestrictedMainView(mainView)) {
    return <p className="home-page__state">{HOME_PAGE_UI.LOADING_SESSION}</p>;
  }

  if (isProfileTabMainView(mainView)) {
    if (
      isSessionReady &&
      !isStaffMainViewAllowed(mainView, { isAdmin, canModerateProducts })
    ) {
      return null;
    }

    const profileTabPanelProps = {
      isAuthorized,
      currentUserId,
      onRequestLogin,
      onSellerNameClick,
      onCatalogProductClick,
      onOpenProductDetails,
      refreshUserProfileActionBadgeCounts,
      myProfilePage,
      handlePremiumPurchased,
      setIsDataConfirmationModalOpen,
      dataConfirmationStatusRefreshTick,
      myProductsCatalogSection,
      raffleRefreshTick,
      refreshPendingModerationCount,
      refreshPendingProductReportsCount,
      refreshPendingRafflesCount,
      refreshPendingDataConfirmationCount,
      refreshPendingInstallmentModerationCount,
      refreshPendingInstallmentDisputesCount,
      refreshFeaturedRaffle,
      setRaffleRefreshTick,
      setCatalogRefreshTick,
      setRaffleModal,
    };

    const profileOverviewContent = (
      <RaffleSellerOverview
        refreshTick={raffleRefreshTick}
        onChanged={() => {
          setRaffleRefreshTick((n) => n + 1);
          void refreshFeaturedRaffle();
          void refreshSellerRaffleState();
        }}
        onEditRaffle={(raffle) =>
          setRaffleModal({ mode: "edit", raffle, useStaffApi: false })
        }
      />
    );

    const tabContent =
      mainView === "my-profile"
        ? profileOverviewContent
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
        onInstallmentModerationClick={
          canModerateProducts ? handleInstallmentModerationFromProfile : undefined
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
        onProductModerationClick={
          canModerateProducts ? handleProductModerationFromProfile : undefined
        }
        onProductReportsClick={
          canModerateProducts ? handleProductReportsFromProfile : undefined
        }
        onRafflesClick={canModerateProducts ? handleRafflesFromProfile : undefined}
        onCreateRaffleClick={onCreateRaffleClick}
        pendingRafflesCount={pendingRafflesCount}
        onDataConfirmationQueueClick={
          canModerateProducts ? handleDataConfirmationQueueFromProfile : undefined
        }
        onDataConfirmationClick={
          isAuthorized ? handleDataConfirmationFromProfile : undefined
        }
        onPremiumClick={isAuthorized ? handlePremiumFromProfile : undefined}
        onLoyaltyPointsClick={isAuthorized ? handleLoyaltyPointsFromProfile : undefined}
        onSubscriptionsClick={isAuthorized ? handleSubscriptionsFromProfile : undefined}
        pendingModerationCount={pendingModerationCount}
        pendingIncomingPriceOffersCount={pendingIncomingPriceOffersCount}
        pendingMySalesActionCount={pendingMySalesActionCount}
        pendingMyOrdersActionCount={pendingMyOrdersActionCount}
        pendingInstallmentBuyerActionCount={pendingInstallmentBuyerActionCount}
        pendingInstallmentSellerActionCount={pendingInstallmentSellerActionCount}
        pendingInstallmentModerationCount={pendingInstallmentModerationCount}
        pendingInstallmentDisputesCount={pendingInstallmentDisputesCount}
        pendingProductReportsCount={pendingProductReportsCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        activeTab={activeProfileTab}
        onTabChange={setMyProfileTab}
        tabContent={tabContent}
      />
    );
  }

  if (mainView === "users") {
    return (
      <LazyUsersPage
        key={usersListTick}
        onUserRowClick={onSellerNameClick}
        isAdminViewer={isAdmin}
      />
    );
  }

  if (mainView === "notifications") {
    if (!isAuthorized) {
      return null;
    }
    return (
      <LazyNotificationsPage
        notifications={notificationsPageItems}
        onNotificationClick={handleInAppNotificationClick}
        onCleared={handleNotificationsCleared}
      />
    );
  }

  return null;
}
