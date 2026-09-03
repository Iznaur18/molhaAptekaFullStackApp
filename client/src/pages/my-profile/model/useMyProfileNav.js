import { useMemo } from "react";

import { USER_ROLE_USER } from "../../../entities/user/model/userConstants.js";
import { IS_ONEC_INTEGRATION_ENABLED } from "../../onec-integration/model/isOneCIntegrationEnabled.js";
import { buildProfileNavGroups } from "../lib/buildProfileNavGroups.js";
import { getActiveProfileNavLabel } from "../lib/getActiveProfileNavLabel.js";

/**
 * @param {{
 *   user: import('../../../entities/user/model/types.js').UserPublicProfile | null;
 *   isProfileReady: boolean;
 *   activeTab: string;
 *   showEditOnBanner: boolean;
 *   pendingModerationCount?: number;
 *   pendingIntroAdModerationCount?: number;
 *   pendingSellerPersonalCategoryModerationCount?: number;
 *   pendingIncomingPriceOffersCount?: number;
 *   pendingMySalesActionCount?: number;
 *   pendingMyOrdersActionCount?: number;
 *   pendingInstallmentBuyerActionCount?: number;
 *   pendingInstallmentSellerActionCount?: number;
 *   pendingInstallmentDisputesCount?: number;
 *   pendingProductReportsCount?: number;
 *   pendingProductPromotionsCount?: number;
 *   pendingRafflesCount?: number;
 *   pendingDataConfirmationCount?: number;
 *   onTabChange?: (tab: string) => void;
 *   onCreateRaffleClick?: () => void;
 *   onMyProductsClick?: () => void;
 *   onMySalesClick?: () => void;
 *   onMyOrdersClick?: () => void;
 *   onAuctionClick?: () => void;
 *   onInstallmentPaymentsClick?: () => void;
 *   onInstallmentSalesClick?: () => void;
 *   onProductModerationClick?: () => void;
 *   onIntroAdModerationClick?: () => void;
 *   onSellerPersonalCategoryModerationClick?: () => void;
 *   onProductReportsClick?: () => void;
 *   onProductPromotionsClick?: () => void;
 *   onRafflesClick?: () => void;
 *   onDataConfirmationQueueClick?: () => void;
 *   onInstallmentDisputesClick?: () => void;
 *   onAdminOrdersClick?: () => void;
 *   onSearchSynonymsAdminClick?: () => void;
 *   onCategoryTreeAdminClick?: () => void;
 *   onAppIntroAdminClick?: () => void;
 *   onSiteHeaderBannerAdminClick?: () => void;
 *   onPopularProductsAdminClick?: () => void;
 *   onSubscriptionsClick?: () => void;
 *   onWishlistClick?: () => void;
 *   onDataConfirmationClick?: () => void;
 *   onPremiumClick?: () => void;
 *   onLoyaltyPointsClick?: () => void;
 *   onPartnerProgramClick?: () => void;
 *   onAdvertisingClick?: () => void;
 *   onOneCIntegrationClick?: () => void;
 *   onSafeDealClick?: () => void;
 *   onEditProfileClick?: () => void;
 * }} params
 */
export function useMyProfileNav({
  user,
  isProfileReady,
  activeTab,
  showEditOnBanner,
  pendingModerationCount = 0,
  pendingIntroAdModerationCount = 0,
  pendingSellerPersonalCategoryModerationCount = 0,
  pendingIncomingPriceOffersCount = 0,
  pendingMySalesActionCount = 0,
  pendingMyOrdersActionCount = 0,
  pendingInstallmentBuyerActionCount = 0,
  pendingInstallmentSellerActionCount = 0,
  pendingInstallmentDisputesCount = 0,
  pendingProductReportsCount = 0,
  pendingProductPromotionsCount = 0,
  pendingRafflesCount = 0,
  pendingDataConfirmationCount = 0,
  onTabChange,
  onCreateRaffleClick,
  onMyProductsClick,
  onMySalesClick,
  onMyOrdersClick,
  onAuctionClick,
  onInstallmentPaymentsClick,
  onInstallmentSalesClick,
  onProductModerationClick,
  onIntroAdModerationClick,
  onSellerPersonalCategoryModerationClick,
  onProductReportsClick,
  onProductPromotionsClick,
  onRafflesClick,
  onCourierClick,
  onCourierModerationClick,
  onShipmentDisputesClick,
  onShippingCarriersClick,
  onCourierOverviewClick,
  onDataConfirmationQueueClick,
  onInstallmentDisputesClick,
  onAdminOrdersClick,
  onSearchSynonymsAdminClick,
  onCategoryTreeAdminClick,
  onAppIntroAdminClick,
  onSiteHeaderBannerAdminClick,
  onPopularProductsAdminClick,
  onSubscriptionsClick,
  onWishlistClick,
  onDataConfirmationClick,
  onPremiumClick,
  onLoyaltyPointsClick,
  onPartnerProgramClick,
  onAdvertisingClick,
  onOneCIntegrationClick,
  onSafeDealClick,
  onEditProfileClick,
}) {
  const isRegularUser = user?.userRole === USER_ROLE_USER;
  const isUserDataConfirmed = user?.isUserDataConfirmed === true;

  const canUseMyProducts = isProfileReady && Boolean(onMyProductsClick);
  const canUseMySales = isProfileReady && Boolean(onMySalesClick);
  const canUseInstallmentPayments =
    isProfileReady && Boolean(onInstallmentPaymentsClick);
  const canUseInstallmentSales = isProfileReady && Boolean(onInstallmentSalesClick);
  const canUseMyOrders = isProfileReady && Boolean(onMyOrdersClick);
  const canUseAuction = isProfileReady && Boolean(onAuctionClick);
  const canUseEditProfile = isProfileReady && Boolean(onEditProfileClick);
  const canUseAdminOrders =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAdminOrdersClick);
  const canUseAdminAnalytics =
    !isRegularUser && isProfileReady && user?.userRole === "admin";
  // Read-only журнал аудита: без prefetch-колбэка, гейт только по роли admin.
  const canUseStaffAuditLogAdmin =
    !isRegularUser && isProfileReady && user?.userRole === "admin";
  const canUseBroadcastNotificationsAdmin =
    !isRegularUser && isProfileReady && user?.userRole === "admin";
  const canUseSearchSynonymsAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onSearchSynonymsAdminClick);
  const canUseCategoryTreeAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onCategoryTreeAdminClick);
  const canUseAppIntroAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onAppIntroAdminClick);
  const canUseSiteHeaderBannerAdmin =
    !isRegularUser && isProfileReady && Boolean(onSiteHeaderBannerAdminClick);
  const canUsePopularProductsAdmin =
    !isRegularUser &&
    isProfileReady &&
    user?.userRole === "admin" &&
    Boolean(onPopularProductsAdminClick);
  const canUseDataConfirmation = isProfileReady && Boolean(onDataConfirmationClick);
  const canUsePremium = isProfileReady && Boolean(onPremiumClick);
  const canUseLoyaltyPoints = isProfileReady && Boolean(onLoyaltyPointsClick);
  const canUsePartnerProgram = isProfileReady && Boolean(onPartnerProgramClick);
  const canUseAdvertising = isProfileReady && Boolean(onAdvertisingClick);
  const canUseOneCIntegration =
    IS_ONEC_INTEGRATION_ENABLED &&
    isProfileReady &&
    Boolean(onOneCIntegrationClick);
  // Безопасную сделку подключает любой авторизованный: подтверждение ИП или
  // ООО и есть фильтр, отдельного признака продавца в профиле нет.
  const canUseSafeDeal = isProfileReady && Boolean(onSafeDealClick);
  const canUseProductModeration =
    !isRegularUser && isProfileReady && Boolean(onProductModerationClick);
  const canUseProductReports =
    !isRegularUser && isProfileReady && Boolean(onProductReportsClick);
  const canUseProductPromotions =
    !isRegularUser && isProfileReady && Boolean(onProductPromotionsClick);
  const canUseRaffles = !isRegularUser && isProfileReady && Boolean(onRafflesClick);
  const canUseCreateRaffle =
    isProfileReady &&
    user?.isUserDataConfirmed === true &&
    Boolean(onCreateRaffleClick);
  // Курьером может стать любой авторизованный; модерация — стаффу.
  const canUseCourier = isProfileReady && Boolean(onCourierClick);
  const canUseCourierModeration =
    !isRegularUser && isProfileReady && Boolean(onCourierModerationClick);
  // «Обзор» показываем только подтверждённому курьеру — остальным там пусто.
  const canUseCourierOverview =
    isProfileReady && user?.courierProfile?.moderationStatus === "approved";
  const canUseDataConfirmationQueue =
    !isRegularUser && isProfileReady && Boolean(onDataConfirmationQueueClick);
  const canUseInstallmentDisputes =
    !isRegularUser && isProfileReady && Boolean(onInstallmentDisputesClick);
  // Споры по доставке разбирают те же, кто модерирует курьеров.
  const canUseShipmentDisputes =
    !isRegularUser && isProfileReady && Boolean(onShipmentDisputesClick);
  // Службы доставки включает только админ: колбэк ему и передают.
  const canUseShippingCarriers = isProfileReady && Boolean(onShippingCarriersClick);
  const canUseSubscriptions = isProfileReady && Boolean(onSubscriptionsClick);
  const canUseWishlist = isProfileReady && Boolean(onWishlistClick);

  const navGroups = useMemo(
    () =>
      buildProfileNavGroups({
        canUseCreateRaffle,
        canUseMyProducts,
        canUseMySales,
        canUseMyOrders,
        canUseAuction,
        canUseInstallmentPayments,
        canUseInstallmentSales,
        canUseProductModeration,
        canUseProductReports,
        canUseProductPromotions,
        canUseRaffles,
        canUseCourier,
        canUseCourierModeration,
        canUseCourierOverview,
        canUseDataConfirmationQueue,
        canUseInstallmentDisputes,
        canUseShipmentDisputes,
        canUseShippingCarriers,
        canUseAdminOrders,
        canUseAdminAnalytics,
        canUseStaffAuditLogAdmin,
        canUseBroadcastNotificationsAdmin,
        canUseSearchSynonymsAdmin,
        canUseCategoryTreeAdmin,
        canUseAppIntroAdmin,
        canUseSiteHeaderBannerAdmin,
        canUsePopularProductsAdmin,
        canUseSubscriptions,
        canUseWishlist,
        canUseDataConfirmation,
        isUserDataConfirmed,
        canUsePremium,
        canUseLoyaltyPoints,
        canUsePartnerProgram,
        canUseAdvertising,
        canUseOneCIntegration,
        canUseSafeDeal,
        canUseEditProfile,
        showEditOnBanner,
        pendingMySalesActionCount,
        pendingMyOrdersActionCount,
        pendingIncomingPriceOffersCount,
        pendingInstallmentBuyerActionCount,
        pendingInstallmentSellerActionCount,
        pendingModerationCount,
        pendingIntroAdModerationCount,
        pendingSellerPersonalCategoryModerationCount,
        pendingProductReportsCount,
        pendingProductPromotionsCount,
        pendingRafflesCount,
        pendingDataConfirmationCount,
        pendingInstallmentDisputesCount,
        onTabChange,
        onCreateRaffleClick,
        onMyProductsClick,
        onMySalesClick,
        onMyOrdersClick,
        onAuctionClick,
        onInstallmentPaymentsClick,
        onInstallmentSalesClick,
        onProductModerationClick,
        onIntroAdModerationClick,
        onSellerPersonalCategoryModerationClick,
        onProductReportsClick,
        onProductPromotionsClick,
        onRafflesClick,
        onCourierClick,
        onCourierModerationClick,
        onCourierOverviewClick,
        onDataConfirmationQueueClick,
        onInstallmentDisputesClick,
        onShipmentDisputesClick,
  onShippingCarriersClick,
        onAdminOrdersClick,
        onSearchSynonymsAdminClick,
        onCategoryTreeAdminClick,
        onAppIntroAdminClick,
        onSiteHeaderBannerAdminClick,
        onPopularProductsAdminClick,
        onSubscriptionsClick,
        onWishlistClick,
        onDataConfirmationClick,
        onPremiumClick,
        onLoyaltyPointsClick,
        onPartnerProgramClick,
        onAdvertisingClick,
        onOneCIntegrationClick,
        onSafeDealClick,
        onEditProfileClick,
      }),
    [
      canUseAdminOrders,
      canUseAuction,
      canUseAppIntroAdmin,
      canUsePopularProductsAdmin,
      canUseCategoryTreeAdmin,
      canUseCourier,
      canUseCourierModeration,
      canUseCourierOverview,
      canUseCreateRaffle,
      canUseDataConfirmation,
      canUseDataConfirmationQueue,
      isUserDataConfirmed,
      canUseEditProfile,
      canUseInstallmentDisputes,
      canUseShipmentDisputes,
      canUseShippingCarriers,
      canUseInstallmentPayments,
      canUseInstallmentSales,
      canUseLoyaltyPoints,
      canUsePartnerProgram,
      canUseAdvertising,
      canUseOneCIntegration,
      canUseSafeDeal,
      canUseMyOrders,
      canUseMyProducts,
      canUseMySales,
      canUsePremium,
      canUseProductModeration,
      canUseProductReports,
      canUseProductPromotions,
      canUseRaffles,
      canUseStaffAuditLogAdmin,
      canUseBroadcastNotificationsAdmin,
      canUseSearchSynonymsAdmin,
      canUseSubscriptions,
      canUseWishlist,
      onAdminOrdersClick,
      onAuctionClick,
      onAppIntroAdminClick,
      onSiteHeaderBannerAdminClick,
      onPopularProductsAdminClick,
      onCategoryTreeAdminClick,
      onCreateRaffleClick,
      onDataConfirmationClick,
      onCourierClick,
      onCourierModerationClick,
      onCourierOverviewClick,
      onDataConfirmationQueueClick,
      onEditProfileClick,
      onInstallmentDisputesClick,
      onShipmentDisputesClick,
  onShippingCarriersClick,
      onInstallmentPaymentsClick,
      onInstallmentSalesClick,
      onLoyaltyPointsClick,
      onPartnerProgramClick,
      onAdvertisingClick,
      onOneCIntegrationClick,
      onSafeDealClick,
      onIntroAdModerationClick,
      onSellerPersonalCategoryModerationClick,
      onMyOrdersClick,
      onMyProductsClick,
      onMySalesClick,
      onPremiumClick,
      onProductModerationClick,
      onProductReportsClick,
      onProductPromotionsClick,
      onRafflesClick,
      onSearchSynonymsAdminClick,
      onSubscriptionsClick,
      onWishlistClick,
      onTabChange,
      pendingDataConfirmationCount,
      pendingIncomingPriceOffersCount,
      pendingInstallmentBuyerActionCount,
      pendingInstallmentDisputesCount,
      pendingInstallmentSellerActionCount,
      pendingModerationCount,
      pendingIntroAdModerationCount,
      pendingSellerPersonalCategoryModerationCount,
      pendingMyOrdersActionCount,
      pendingMySalesActionCount,
      pendingProductReportsCount,
      pendingProductPromotionsCount,
      pendingRafflesCount,
      showEditOnBanner,
    ],
  );

  const activeNavLabel = useMemo(
    () => getActiveProfileNavLabel(navGroups, activeTab),
    [activeTab, navGroups],
  );

  return {
    navGroups,
    activeNavLabel,
  };
}
