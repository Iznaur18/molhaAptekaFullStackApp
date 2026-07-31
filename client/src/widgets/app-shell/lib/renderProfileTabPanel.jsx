import {
  LazyAdminOrdersPage,
  LazyAuctionPage,
  LazyCategoryTreeAdminPage,
  LazyDataConfirmationPage,
  LazyDataConfirmationRequestsPage,
  LazyInstallmentDisputesPage,
  LazyInstallmentPaymentsPage,
  LazyInstallmentSalesPage,
  LazyLoyaltyPointsPage,
  LazyPartnerProgramPage,
  LazyAffiliateListingsPage,
  LazyAdvertisingPage,
  LazyEditProfilePage,
  LazyIntroAdModerationPage,
  LazySellerPersonalCategoryModerationPage,
  LazyMyOrdersPage,
  LazyMySalesPage,
  LazyPremiumPage,
  LazyProductModerationPage,
  LazyProductReportsPage,
  LazyRafflesStaffPage,
  LazyStaffAuditLogAdminPage,
  LazySearchSynonymsAdminPage,
  LazyAppIntroAdminPage,
  LazySiteHeaderBannerAdminPage,
  LazyPopularProductsAdminPage,
  LazySubscriptionsPage,
  LazyWishlistPage,
} from "./lazyAppShellPages.js";

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
    isPremiumUser = false,
    isAdmin = false,
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
    refreshPendingRafflesCount,
    refreshPendingDataConfirmationCount,
    refreshPendingInstallmentDisputesCount,
    refreshRaffleSurfaces,
    refreshCatalogFeed,
    setRaffleModal,
    onLoyaltyPointsBalanceChange,
    canModerateProducts = false,
    onEditProfileCancel,
    onEditProfileSaved,
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
          isAdmin={isAdmin}
          onRequestLogin={onRequestLogin}
          onLoyaltyPointsBalanceChange={onLoyaltyPointsBalanceChange}
        />
      );
    case "partner-program":
      return (
        <LazyPartnerProgramPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onLoyaltyPointsBalanceChange={onLoyaltyPointsBalanceChange}
        />
      );
    case "affiliate-listings":
      return (
        <LazyAffiliateListingsPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
        />
      );
    case "advertising":
      return (
        <LazyAdvertisingPage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          onOpenCreateRaffle={() => setRaffleModal({ mode: "create" })}
        />
      );
    case "edit-profile":
      return (
        <LazyEditProfilePage
          isAuthorized={isAuthorized}
          onRequestLogin={onRequestLogin}
          user={myProfilePage.phase === "success" ? myProfilePage.user : null}
          allowStaffLoyaltyEdit={canModerateProducts}
          onCancel={onEditProfileCancel}
          onSaved={onEditProfileSaved}
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
    case "wishlist":
      return (
        <LazyWishlistPage
          isAuthorized={isAuthorized}
          currentUserId={currentUserId}
          isPremiumUser={isPremiumUser}
          onRequestLogin={onRequestLogin}
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
          totalSalesCount={
            myProfilePage.phase === "success"
              ? myProfilePage.user?.totalSalesCount
              : 0
          }
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
    case "staff-audit-log-admin":
      return <LazyStaffAuditLogAdminPage />;
    case "search-synonyms-admin":
      return <LazySearchSynonymsAdminPage />;
    case "category-tree-admin":
      return <LazyCategoryTreeAdminPage />;
    case "app-intro-admin":
      return <LazyAppIntroAdminPage />;
    case "site-header-banner-admin":
      return <LazySiteHeaderBannerAdminPage />;
    case "popular-products-admin":
      return <LazyPopularProductsAdminPage />;
    case "product-moderation":
      return (
        <LazyProductModerationPage
          onSellerNameClick={onSellerNameClick}
          onQueueChanged={refreshPendingModerationCount}
          isAdmin={isAdmin}
        />
      );
    case "intro-ad-moderation":
      return (
        <LazyIntroAdModerationPage
          onQueueChanged={() => {
            refreshPendingIntroAdModerationCount?.();
            void refreshPendingRafflesCount?.();
            void refreshRaffleSurfaces?.();
            void refreshCatalogFeed?.();
          }}
          onEditRaffle={(raffle) =>
            setRaffleModal({ mode: "edit", raffle, useStaffApi: true })
          }
        />
      );
    case "seller-personal-category-moderation":
      return (
        <LazyIntroAdModerationPage
          onQueueChanged={() => {
            refreshPendingIntroAdModerationCount?.();
            void refreshPendingRafflesCount?.();
            void refreshRaffleSurfaces?.();
            void refreshCatalogFeed?.();
          }}
          onEditRaffle={(raffle) =>
            setRaffleModal({ mode: "edit", raffle, useStaffApi: true })
          }
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
        <LazyIntroAdModerationPage
          onQueueChanged={() => {
            refreshPendingIntroAdModerationCount?.();
            void refreshPendingRafflesCount?.();
            void refreshRaffleSurfaces?.();
            void refreshCatalogFeed?.();
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
