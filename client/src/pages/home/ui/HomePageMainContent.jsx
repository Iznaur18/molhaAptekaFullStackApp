import { RaffleProductsPage } from "../../raffle/ui/RaffleProductsPage.jsx";
import { RafflesStaffPage } from "../../raffles-staff/ui/RafflesStaffPage.jsx";
import { ProductPromotionsStaffPage } from "../../product-promotions/ui/ProductPromotionsStaffPage.jsx";
import { ProductModerationPage } from "../../product-moderation/ui/ProductModerationPage.jsx";
import { ProductReportsPage } from "../../product-reports/ui/ProductReportsPage.jsx";
import { DataConfirmationRequestsPage } from "../../data-confirmation-requests/ui/DataConfirmationRequestsPage.jsx";
import { InstallmentPaymentsPage } from "../../installment-payments/ui/InstallmentPaymentsPage.jsx";
import { InstallmentSalesPage } from "../../installment-sales/ui/InstallmentSalesPage.jsx";
import { InstallmentModerationPage } from "../../installment-moderation/ui/InstallmentModerationPage.jsx";
import { InstallmentDisputesPage } from "../../installment-disputes/ui/InstallmentDisputesPage.jsx";
import { AuctionPage } from "../../auction/ui/AuctionPage.jsx";
import { AdminOrdersPage } from "../../admin-orders/ui/AdminOrdersPage.jsx";
import { CartPage } from "../../cart/ui/CartPage.jsx";
import { MyOrdersPage } from "../../my-orders/ui/MyOrdersPage.jsx";
import { MySalesPage } from "../../my-sales/ui/MySalesPage.jsx";
import { UsersPage } from "../../users/ui/UsersPage.jsx";
import { SubscriptionsPage } from "../../subscriptions/ui/SubscriptionsPage.jsx";
import { NotificationsPage } from "../../notifications/ui/NotificationsPage.jsx";
import { MyProfilePage } from "../../my-profile/ui/MyProfilePage.jsx";
import { PremiumPage } from "../../premium/ui/PremiumPage.jsx";
import { LoyaltyPointsPage } from "../../loyalty-points/ui/LoyaltyPointsPage.jsx";
import { RaffleSellerOverview } from "../../../entities/raffle/ui/RaffleSellerOverview.jsx";
import {
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_INSTALLMENT_DISPUTES,
  PROFILE_TAB_INSTALLMENT_MODERATION,
  PROFILE_TAB_INSTALLMENT_PAYMENTS,
  PROFILE_TAB_INSTALLMENT_SALES,
  PROFILE_TAB_LOYALTY_POINTS,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_MY_PRODUCTS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_PREMIUM,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_PRODUCT_PROMOTIONS,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_RAFFLES,
  PROFILE_TAB_SUBSCRIPTIONS,
} from "../../my-profile/lib/profileTabs.js";
import { HOME_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { isRoleRestrictedMainView } from "../../../shared/lib/homeMainViewPaths.js";

/** @typedef {import('../../../entities/product/model/types.js').ProductFromApi} ProductFromApi */

/**
 * @param {{
 *   isRaffleRoute: boolean;
 *   raffleRouteId: string | null;
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
 *   catalogGridSection: import('react').ReactNode;
 *   catalogBrowserSection: import('react').ReactNode;
 *   onRequestLogin: () => void;
 *   onSellerNameClick: (userId: string) => void;
 *   onCatalogProductClick: (product: ProductFromApi) => void;
 *   onOpenProductDetails: (product: ProductFromApi) => void;
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
 *   handleProductModerationFromProfile: () => void;
 *   handleProductReportsFromProfile: () => void;
 *   handleProductPromotionsFromProfile: () => void;
 *   handleRafflesFromProfile: () => void;
 *   onCreateRaffleClick: () => void;
 *   handleDataConfirmationQueueFromProfile: () => void;
 *   handleDataConfirmationFromProfile: () => void;
 *   handlePremiumFromProfile: () => void;
 *   handlePremiumPurchased: () => void;
 *   handleLoyaltyPointsFromProfile: () => void;
 *   handleSubscriptionsFromProfile: () => void;
 *   refreshUserProfileActionBadgeCounts: () => void | Promise<void>;
 *   refreshPendingModerationCount: () => void | Promise<void>;
 *   refreshPendingProductReportsCount: () => void | Promise<void>;
 *   refreshPendingProductPromotionsCount: () => void | Promise<void>;
 *   refreshPendingRafflesCount: () => void | Promise<void>;
 *   refreshPendingDataConfirmationCount: () => void | Promise<void>;
 *   refreshPendingInstallmentModerationCount: () => void | Promise<void>;
 *   refreshPendingInstallmentDisputesCount: () => void | Promise<void>;
 *   refreshFeaturedRaffle: () => void | Promise<void>;
 *   refreshSellerRaffleState: () => void | Promise<void>;
 *   setRaffleRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setCatalogRefreshTick: import('react').Dispatch<import('react').SetStateAction<number>>;
 *   setRaffleModal: import('react').Dispatch<import('react').SetStateAction<object | null>>;
 *   handleInAppNotificationClick: (notification: import('../../../entities/product-report/model/types.js').UserInAppNotification) => void;
 *   handleNotificationsCleared: () => void;
 * }} props
 */
export function HomePageMainContent({
  isRaffleRoute,
  raffleRouteId,
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
  catalogGridSection,
  catalogBrowserSection,
  onRequestLogin,
  onSellerNameClick,
  onCatalogProductClick,
  onOpenProductDetails,
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
  handleProductModerationFromProfile,
  handleProductReportsFromProfile,
  handleProductPromotionsFromProfile,
  handleRafflesFromProfile,
  onCreateRaffleClick,
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
  setRaffleModal,
  handleInAppNotificationClick,
  handleNotificationsCleared,
}) {
  if (isRaffleRoute && raffleRouteId) {
    return (
      <RaffleProductsPage
        raffleId={raffleRouteId}
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onRequestLoginAddToCart={onRequestLogin}
        onSellerNameClick={onSellerNameClick}
        onOpenProductDetails={onOpenProductDetails}
        onBackToCatalog={() => goToMainView("catalog")}
      />
    );
  }

  const isProfileRoleRestrictedTab =
    mainView === "my-profile" &&
    (activeProfileTab === PROFILE_TAB_ADMIN_ORDERS ||
      activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION ||
      activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS ||
      activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS ||
      activeProfileTab === PROFILE_TAB_RAFFLES ||
      activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS ||
      activeProfileTab === PROFILE_TAB_INSTALLMENT_MODERATION ||
      activeProfileTab === PROFILE_TAB_INSTALLMENT_DISPUTES);

  if (
    isAuthorized &&
    !isSessionReady &&
    (isRoleRestrictedMainView(mainView) || isProfileRoleRestrictedTab)
  ) {
    return (
      <p className="home-page__state">{HOME_PAGE_UI.LOADING_SESSION}</p>
    );
  }

  if (mainView === "my-profile") {
    const profileTabContent = (() => {
      if (activeProfileTab === PROFILE_TAB_MY_PRODUCTS) {
        return catalogGridSection;
      }
      if (activeProfileTab === PROFILE_TAB_MY_ORDERS) {
        return (
          <MyOrdersPage
            isAuthorized={isAuthorized}
            currentUserId={currentUserId}
            onSellerNameClick={onSellerNameClick}
            onRequestLogin={onRequestLogin}
            onQueueChanged={refreshUserProfileActionBadgeCounts}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_AUCTION) {
        return (
          <AuctionPage
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
      if (activeProfileTab === PROFILE_TAB_MY_SALES) {
        return (
          <MySalesPage
            isAuthorized={isAuthorized}
            currentUserId={currentUserId}
            onSellerNameClick={onSellerNameClick}
            onQueueChanged={refreshUserProfileActionBadgeCounts}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_INSTALLMENT_PAYMENTS) {
        return (
          <InstallmentPaymentsPage
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
            onCounterpartyClick={onSellerNameClick}
            onProductClick={onCatalogProductClick}
            onQueueChanged={refreshUserProfileActionBadgeCounts}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_INSTALLMENT_SALES) {
        return (
          <InstallmentSalesPage
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
            onCounterpartyClick={onSellerNameClick}
            onProductClick={onCatalogProductClick}
            onQueueChanged={refreshUserProfileActionBadgeCounts}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_SUBSCRIPTIONS) {
        return (
          <SubscriptionsPage
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
            onUserClick={onSellerNameClick}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_PREMIUM) {
        return (
          <PremiumPage
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
            onPurchased={handlePremiumPurchased}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_LOYALTY_POINTS) {
        return (
          <LoyaltyPointsPage
            isAuthorized={isAuthorized}
            onRequestLogin={onRequestLogin}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_ADMIN_ORDERS && isAdmin) {
        return <AdminOrdersPage />;
      }
      if (activeProfileTab === PROFILE_TAB_PRODUCT_MODERATION && canModerateProducts) {
        return (
          <ProductModerationPage
            onSellerNameClick={onSellerNameClick}
            onQueueChanged={refreshPendingModerationCount}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_PRODUCT_REPORTS && canModerateProducts) {
        return (
          <ProductReportsPage
            onSellerNameClick={onSellerNameClick}
            onProductClick={onOpenProductDetails}
            onQueueChanged={() => void refreshPendingProductReportsCount()}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_PRODUCT_PROMOTIONS && canModerateProducts) {
        return (
          <ProductPromotionsStaffPage
            onQueueChanged={() => {
              void refreshPendingProductPromotionsCount();
              setCatalogRefreshTick((n) => n + 1);
            }}
          />
        );
      }
      if (activeProfileTab === PROFILE_TAB_RAFFLES && canModerateProducts) {
        return (
          <RafflesStaffPage
            refreshTick={raffleRefreshTick}
            onQueueChanged={() => {
              void refreshPendingRafflesCount();
              setRaffleRefreshTick((n) => n + 1);
              setCatalogRefreshTick((n) => n + 1);
              void refreshFeaturedRaffle();
            }}
            onEditRaffle={(raffle) =>
              setRaffleModal({ mode: "edit", raffle, useStaffApi: true })
            }
          />
        );
      }
      if (
        activeProfileTab === PROFILE_TAB_DATA_CONFIRMATION_REQUESTS &&
        canModerateProducts
      ) {
        return (
          <DataConfirmationRequestsPage
            onApplicantClick={onSellerNameClick}
            onQueueChanged={() => void refreshPendingDataConfirmationCount()}
          />
        );
      }
      if (
        activeProfileTab === PROFILE_TAB_INSTALLMENT_MODERATION &&
        canModerateProducts
      ) {
        return (
          <InstallmentModerationPage
            onQueueChanged={refreshPendingInstallmentModerationCount}
          />
        );
      }
      if (
        activeProfileTab === PROFILE_TAB_INSTALLMENT_DISPUTES &&
        canModerateProducts
      ) {
        return (
          <InstallmentDisputesPage
            onQueueChanged={refreshPendingInstallmentDisputesCount}
          />
        );
      }
      return (
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
    })();

    return (
      <MyProfilePage
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
        onLoyaltyPointsClick={
          isAuthorized ? handleLoyaltyPointsFromProfile : undefined
        }
        onSubscriptionsClick={
          isAuthorized ? handleSubscriptionsFromProfile : undefined
        }
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
        tabContent={profileTabContent}
      />
    );
  }

  if (mainView === "users") {
    return (
      <UsersPage
        key={usersListTick}
        onUserRowClick={onSellerNameClick}
        isAdminViewer={isAdmin}
      />
    );
  }
  if (mainView === "subscriptions") {
    return (
      <SubscriptionsPage
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
      <NotificationsPage
        notifications={notificationsPageItems}
        onNotificationClick={handleInAppNotificationClick}
        onCleared={handleNotificationsCleared}
      />
    );
  }
  if (mainView === "cart") {
    return (
      <CartPage
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onRequestLogin={onRequestLogin}
        onGoToCatalog={() => goToMainView("catalog")}
        onCheckoutSuccess={() => {
          void refreshUserProfileActionBadgeCounts();
          goToMainView("my-orders");
        }}
        onSellerNameClick={onSellerNameClick}
      />
    );
  }
  if (mainView === "my-orders") {
    return (
      <MyOrdersPage
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
      <MySalesPage
        isAuthorized={isAuthorized}
        currentUserId={currentUserId}
        onSellerNameClick={onSellerNameClick}
      />
    );
  }
  if (mainView === "admin-orders") {
    if (!isAdmin) return null;
    return <AdminOrdersPage />;
  }
  if (mainView === "product-moderation") {
    if (!canModerateProducts) return null;
    return (
      <ProductModerationPage
        onSellerNameClick={onSellerNameClick}
        onQueueChanged={refreshPendingModerationCount}
      />
    );
  }
  if (mainView === "product-reports") {
    if (!canModerateProducts) return null;
    return (
      <ProductReportsPage
        onSellerNameClick={onSellerNameClick}
        onProductClick={onOpenProductDetails}
        onQueueChanged={() => void refreshPendingProductReportsCount()}
      />
    );
  }
  if (mainView === "data-confirmation-requests") {
    if (!canModerateProducts) return null;
    return (
      <DataConfirmationRequestsPage
        onApplicantClick={onSellerNameClick}
        onQueueChanged={() => void refreshPendingDataConfirmationCount()}
      />
    );
  }
  if (mainView === "installment-payments") {
    return (
      <InstallmentPaymentsPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onCounterpartyClick={onSellerNameClick}
        onProductClick={onCatalogProductClick}
      />
    );
  }
  if (mainView === "installment-sales") {
    return (
      <InstallmentSalesPage
        isAuthorized={isAuthorized}
        onRequestLogin={onRequestLogin}
        onCounterpartyClick={onSellerNameClick}
        onProductClick={onCatalogProductClick}
      />
    );
  }
  if (mainView === "installment-moderation") {
    if (!canModerateProducts) return null;
    return (
      <InstallmentModerationPage
        onQueueChanged={refreshPendingInstallmentModerationCount}
      />
    );
  }
  if (mainView === "installment-disputes") {
    if (!canModerateProducts) return null;
    return (
      <InstallmentDisputesPage
        onQueueChanged={refreshPendingInstallmentDisputesCount}
      />
    );
  }

  if (mainView === "catalog-browser") {
    return catalogBrowserSection;
  }

  return catalogGridSection;
}
