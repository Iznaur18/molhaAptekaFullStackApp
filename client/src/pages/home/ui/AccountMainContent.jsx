import { RaffleSellerOverview } from "../../../entities/raffle/ui/RaffleSellerOverview.jsx";
import {
  LazyAuctionPage,
  LazyDataConfirmationPage,
  LazyInstallmentPaymentsPage,
  LazyInstallmentSalesPage,
  LazyLoyaltyPointsPage,
  LazyMyOrdersPage,
  LazyMyProfilePage,
  LazyMySalesPage,
  LazyNotificationsPage,
  LazyPremiumPage,
  LazySubscriptionsPage,
  LazyUsersPage,
} from "../lib/lazyHomePages.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { isRoleRestrictedMainView } from "../../../shared/lib/homeMainViewPaths.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {{
 *   isRaffleRoute: boolean;
 *   raffleRouteId: string | null;
 *   isSellerRoute: boolean;
 *   sellerRouteId: string | null;
 *   isAuthorized: boolean;
 *   isSessionReady: boolean;
 *   mainView: string;
 *   activeProfileTab: string;
 *   currentUserId: string | null;
 *   isAdmin: boolean;
 *   canModerateProducts: boolean;
 *   myProfilePage: { phase: string; user?: object | null; error?: string };
 *   usersListTick: number;
 *   notificationsPageItems: import('../../../entities/product-report/model/types.js').UserInAppNotification[];
 *   raffleRefreshTick: number;
 *   pendingRafflesCount: number;
 *   pendingModerationCount: number;
 *   pendingIncomingPriceOffersCount: number;
 *   pendingMySalesActionCount: number;
 *   pendingMyOrdersActionCount: number;
 *   pendingInstallmentBuyerActionCount: number;
 *   pendingInstallmentSellerActionCount: number;
 *   pendingInstallmentModerationCount: number;
 *   pendingInstallmentDisputesCount: number;
 *   pendingProductReportsCount: number;
 *   pendingProductPromotionsCount: number;
 *   pendingDataConfirmationCount: number;
 *   onRequestLogin: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   onCatalogProductClick: (product: ProductFromApi) => void;
 *   goToMainView: (view: string) => void;
 *   setMyProfileTab: (tab: string) => void;
 *   handleLogout: () => void;
 *   onEditProfileClick: () => void;
 *   handleMyProductsFromProfile: () => void;
 *   handleMySalesFromProfile: () => void;
 *   handleInstallmentPaymentsFromProfile: () => void;
 *   handleInstallmentSalesFromProfile: () => void;
 *   handleInstallmentModerationFromProfile: () => void;
 *   handleInstallmentDisputesFromProfile: () => void;
 *   handleMyOrdersFromProfile: () => void;
 *   handleAuctionFromProfile: () => void;
 *   handleAdminOrdersFromProfile: () => void;
 *   handleSearchSynonymsAdminFromProfile: () => void;
 *   handleCategoryTreeAdminFromProfile: () => void;
 *   handleProductModerationFromProfile: () => void;
 *   handleProductReportsFromProfile: () => void;
 *   handleProductPromotionsFromProfile: () => void;
 *   handleRafflesFromProfile: () => void;
 *   onCreateRaffleClick: () => void;
 *   handleDataConfirmationQueueFromProfile: () => void;
 *   handleDataConfirmationFromProfile: () => void;
 *   setIsDataConfirmationModalOpen: (open: boolean) => void;
 *   dataConfirmationStatusRefreshTick: number;
 *   handlePremiumFromProfile: () => void;
 *   handlePremiumPurchased: () => void;
 *   handleLoyaltyPointsFromProfile: () => void;
 *   handleSubscriptionsFromProfile: () => void;
 *   refreshUserProfileActionBadgeCounts: () => void | Promise<void>;
 *   refreshFeaturedRaffle: () => void | Promise<void>;
 *   refreshSellerRaffleState: () => void | Promise<void>;
 *   setRaffleRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setCatalogRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setRaffleModal: import('react').Dispatch<import('react').SetStateAction<object | null>>;
 *   handleInAppNotificationClick: (notification: import('../../../entities/product-report/model/types.js').UserInAppNotification) => void;
 *   handleNotificationsCleared: () => void;
 * }} props
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
  pendingProductPromotionsCount,
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
  handleProductPromotionsFromProfile,
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
  refreshFeaturedRaffle,
  refreshSellerRaffleState,
  setRaffleRefreshTick,
  setCatalogRefreshTick,
  setRaffleModal,
  handleInAppNotificationClick,
  handleNotificationsCleared,
}) {
  if (isAuthorized && !isSessionReady && isRoleRestrictedMainView(mainView)) {
    return <p className="home-page__state">{HOME_PAGE_UI.LOADING_SESSION}</p>;
  }

  if (mainView === "my-profile") {
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
        onProductPromotionsClick={
          canModerateProducts ? handleProductPromotionsFromProfile : undefined
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
        pendingProductPromotionsCount={pendingProductPromotionsCount}
        pendingDataConfirmationCount={pendingDataConfirmationCount}
        activeTab={activeProfileTab}
        onTabChange={setMyProfileTab}
        tabContent={profileOverviewContent}
      />
    );
  }

  if (mainView === "auction") {
    return (
      <LazyAuctionPage
        isAuthorized={isAuthorized}
        isUserDataConfirmed={
          myProfilePage.phase === "success" &&
          myProfilePage.user?.isUserDataConfirmed === true
        }
        onRequestLogin={onRequestLogin}
        onProductClick={onCatalogProductClick}
        onBuyerClick={onSellerNameClick}
        onQueueChanged={refreshUserProfileActionBadgeCounts}
      />
    );
  }
  if (mainView === "data-confirmation") {
    return (
      <LazyDataConfirmationPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onOpenRequest={() => setIsDataConfirmationModalOpen(true)}
        statusRefreshTick={dataConfirmationStatusRefreshTick}
      />
    );
  }
  if (mainView === "premium") {
    return (
      <LazyPremiumPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onPurchased={handlePremiumPurchased}
      />
    );
  }
  if (mainView === "loyalty-points") {
    return (
      <LazyLoyaltyPointsPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
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
  if (mainView === "subscriptions") {
    return (
      <LazySubscriptionsPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onUserClick={onSellerNameClick}
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
  if (mainView === "my-orders") {
    return (
      <LazyMyOrdersPage
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onSellerNameClick={onSellerNameClick}
        onRequestLogin={onRequestLogin}
        onQueueChanged={refreshUserProfileActionBadgeCounts}
      />
    );
  }
  if (mainView === "my-sales") {
    return (
      <LazyMySalesPage
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onSellerNameClick={onSellerNameClick}
        onQueueChanged={refreshUserProfileActionBadgeCounts}
      />
    );
  }
  if (mainView === "installment-payments") {
    return (
      <LazyInstallmentPaymentsPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onCounterpartyClick={onSellerNameClick}
        onProductClick={onCatalogProductClick}
        onQueueChanged={refreshUserProfileActionBadgeCounts}
      />
    );
  }
  if (mainView === "installment-sales") {
    return (
      <LazyInstallmentSalesPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onCounterpartyClick={onSellerNameClick}
        onProductClick={onCatalogProductClick}
        onQueueChanged={refreshUserProfileActionBadgeCounts}
      />
    );
  }

  return null;
}
