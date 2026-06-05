import {
  LazyAdminOrdersPage,
  LazyAuctionPage,
  LazyCategoryTreeAdminPage,
  LazyDataConfirmationPage,
  LazyDataConfirmationRequestsPage,
  LazyInstallmentDisputesPage,
  LazyInstallmentModerationPage,
  LazyInstallmentPaymentsPage,
  LazyInstallmentSalesPage,
  LazyLoyaltyPointsPage,
  LazyMyOrdersPage,
  LazyMySalesPage,
  LazyPremiumPage,
  LazyProductModerationPage,
  LazyProductReportsPage,
  LazyRafflesStaffPage,
  LazySearchSynonymsAdminPage,
  LazySubscriptionsPage,
} from "../../home/lib/lazyHomePages.js";

/**
 * Контент вкладки профиля (без оболочки MyProfilePage).
 *
 * @param {import("../../../shared/lib/homeMainViewPaths.js").HomeMainView} mainView
 * @param {object} props
 * @param {import("react").ReactNode} [props.myProductsCatalogSection]
 */
export function renderProfileTabPanel(mainView, props) {
  const {
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
  } = props;

  switch (mainView) {
    case "my-products":
      return myProductsCatalogSection ?? null;
    case "auction":
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
    case "data-confirmation":
      return (
        <LazyDataConfirmationPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onOpenRequest={() => setIsDataConfirmationModalOpen(true)}
          statusRefreshTick={dataConfirmationStatusRefreshTick}
        />
      );
    case "premium":
      return (
        <LazyPremiumPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onPurchased={handlePremiumPurchased}
        />
      );
    case "loyalty-points":
      return (
        <LazyLoyaltyPointsPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
        />
      );
    case "subscriptions":
      return (
        <LazySubscriptionsPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onUserClick={onSellerNameClick}
        />
      );
    case "my-orders":
      return (
        <LazyMyOrdersPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onSellerNameClick={onSellerNameClick}
          onRequestLogin={onRequestLogin}
          onQueueChanged={refreshUserProfileActionBadgeCounts}
        />
      );
    case "my-sales":
      return (
        <LazyMySalesPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          onSellerNameClick={onSellerNameClick}
          onQueueChanged={refreshUserProfileActionBadgeCounts}
        />
      );
    case "installment-payments":
      return (
        <LazyInstallmentPaymentsPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onCounterpartyClick={onSellerNameClick}
          onProductClick={onCatalogProductClick}
          onQueueChanged={refreshUserProfileActionBadgeCounts}
        />
      );
    case "installment-sales":
      return (
        <LazyInstallmentSalesPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onCounterpartyClick={onSellerNameClick}
          onProductClick={onCatalogProductClick}
          onQueueChanged={refreshUserProfileActionBadgeCounts}
        />
      );
    case "admin-orders":
      return <LazyAdminOrdersPage />;
    case "search-synonyms-admin":
      return <LazySearchSynonymsAdminPage />;
    case "category-tree-admin":
      return <LazyCategoryTreeAdminPage />;
    case "product-moderation":
      return (
        <LazyProductModerationPage
          onSellerNameClick={onSellerNameClick}
          onQueueChanged={refreshPendingModerationCount}
        />
      );
    case "product-reports":
      return (
        <LazyProductReportsPage
          onSellerNameClick={onSellerNameClick}
          onProductClick={onOpenProductDetails}
          onQueueChanged={() => void refreshPendingProductReportsCount()}
        />
      );
    case "staff-raffles":
      return (
        <LazyRafflesStaffPage
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
    case "data-confirmation-requests":
      return (
        <LazyDataConfirmationRequestsPage
          onApplicantClick={onSellerNameClick}
          onQueueChanged={() => void refreshPendingDataConfirmationCount()}
        />
      );
    case "installment-moderation":
      return (
        <LazyInstallmentModerationPage
          onQueueChanged={refreshPendingInstallmentModerationCount}
        />
      );
    case "installment-disputes":
      return (
        <LazyInstallmentDisputesPage
          onQueueChanged={refreshPendingInstallmentDisputesCount}
        />
      );
    default:
      return null;
  }
}
