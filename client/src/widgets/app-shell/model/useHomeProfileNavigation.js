import { useCallback } from "react";

import {
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_SEARCH_SYNONYMS_ADMIN,
  PROFILE_TAB_CATEGORY_TREE_ADMIN,
  PROFILE_TAB_APP_INTRO_ADMIN,
  PROFILE_TAB_SITE_HEADER_BANNER_ADMIN,
  PROFILE_TAB_POPULAR_PRODUCTS_ADMIN,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_DATA_CONFIRMATION,
  PROFILE_TAB_DATA_CONFIRMATION_REQUESTS,
  PROFILE_TAB_COURIER,
  PROFILE_TAB_COURIER_MODERATION,
  PROFILE_TAB_SHIPMENT_DISPUTES,
  PROFILE_TAB_COURIER_OVERVIEW,
  PROFILE_TAB_INSTALLMENT_DISPUTES,
  PROFILE_TAB_INSTALLMENT_PAYMENTS,
  PROFILE_TAB_INSTALLMENT_SALES,
  PROFILE_TAB_LOYALTY_POINTS,
  PROFILE_TAB_PARTNER_PROGRAM,
  PROFILE_TAB_ADVERTISING,
  PROFILE_TAB_ONEC_INTEGRATION,
  PROFILE_TAB_EDIT_PROFILE,
  PROFILE_TAB_MY_ORDERS,
  PROFILE_TAB_MY_SALES,
  PROFILE_TAB_PREMIUM,
  PROFILE_TAB_PRODUCT_MODERATION,
  PROFILE_TAB_INTRO_AD_MODERATION,
  PROFILE_TAB_PRODUCT_PROMOTIONS,
  PROFILE_TAB_PRODUCT_REPORTS,
  PROFILE_TAB_RAFFLES,
  PROFILE_TAB_SUBSCRIPTIONS,
  PROFILE_TAB_WISHLIST,
} from "../lib/profileTabs.js";

import { profileTabToMainView } from "../lib/profileTabToMainView.js";

/**

 * @param {{

 *   goToMainView: (view: import('../../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;

 *   setMyProductsCatalogError: (message: string) => void;

 *   myProfilePage: { phase: string; user?: { _id?: string } | null };

 *   setLoyaltyPoints: (value: number) => void;
 *   invalidateAuthMe: () => Promise<unknown>;
 * }} params
 */
export const useHomeProfileNavigation = ({
  goToMainView,
  setMyProductsCatalogError,
  myProfilePage,
  setLoyaltyPoints,
  invalidateAuthMe,
}) => {
  const navigateFromProfileTab = useCallback(
    (tab) => {
      goToMainView(profileTabToMainView(tab));
    },

    [goToMainView],
  );

  const handleMyProductsFromProfile = useCallback(() => {
    if (myProfilePage.phase !== "success" || !myProfilePage.user?._id) {
      return;
    }

    setMyProductsCatalogError("");

    goToMainView("my-products");
  }, [myProfilePage, setMyProductsCatalogError, goToMainView]);

  const handleMyOrdersFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_MY_ORDERS);
  }, [navigateFromProfileTab]);

  const handleMySalesFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_MY_SALES);
  }, [navigateFromProfileTab]);

  const handleInstallmentPaymentsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INSTALLMENT_PAYMENTS);
  }, [navigateFromProfileTab]);

  const handleInstallmentSalesFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INSTALLMENT_SALES);
  }, [navigateFromProfileTab]);

  const handleInstallmentDisputesFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INSTALLMENT_DISPUTES);
  }, [navigateFromProfileTab]);

  const handleAdminOrdersFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_ADMIN_ORDERS);
  }, [navigateFromProfileTab]);

  const handleSearchSynonymsAdminFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_SEARCH_SYNONYMS_ADMIN);
  }, [navigateFromProfileTab]);

  const handleCategoryTreeAdminFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_CATEGORY_TREE_ADMIN);
  }, [navigateFromProfileTab]);

  const handleAppIntroAdminFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_APP_INTRO_ADMIN);
  }, [navigateFromProfileTab]);

  const handleSiteHeaderBannerAdminFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_SITE_HEADER_BANNER_ADMIN);
  }, [navigateFromProfileTab]);

  const handlePopularProductsAdminFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_POPULAR_PRODUCTS_ADMIN);
  }, [navigateFromProfileTab]);

  const handleProductModerationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_PRODUCT_MODERATION);
  }, [navigateFromProfileTab]);

  const handleProductReportsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_PRODUCT_REPORTS);
  }, [navigateFromProfileTab]);

  const handleProductPromotionsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_PRODUCT_PROMOTIONS);
  }, [navigateFromProfileTab]);

  const handleRafflesFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_RAFFLES);
  }, [navigateFromProfileTab]);

  const handleAuctionFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_AUCTION);
  }, [navigateFromProfileTab]);

  const handleCourierFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_COURIER);
  }, [navigateFromProfileTab]);

  const handleCourierOverviewFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_COURIER_OVERVIEW);
  }, [navigateFromProfileTab]);

  const handleCourierModerationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_COURIER_MODERATION);
  }, [navigateFromProfileTab]);

  const handleShipmentDisputesFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_SHIPMENT_DISPUTES);
  }, [navigateFromProfileTab]);

  const handleDataConfirmationQueueFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_DATA_CONFIRMATION_REQUESTS);
  }, [navigateFromProfileTab]);

  const handleDataConfirmationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_DATA_CONFIRMATION);
  }, [navigateFromProfileTab]);

  const handlePremiumFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_PREMIUM);
  }, [navigateFromProfileTab]);

  const handleLoyaltyPointsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_LOYALTY_POINTS);
  }, [navigateFromProfileTab]);

  const handlePartnerProgramFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_PARTNER_PROGRAM);
  }, [navigateFromProfileTab]);

  const handleAdvertisingFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_ADVERTISING);
  }, [navigateFromProfileTab]);

  const handleOneCIntegrationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_ONEC_INTEGRATION);
  }, [navigateFromProfileTab]);

  const handleEditProfileFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_EDIT_PROFILE);
  }, [navigateFromProfileTab]);

  const handleIntroAdModerationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INTRO_AD_MODERATION);
  }, [navigateFromProfileTab]);

  const handleSellerPersonalCategoryModerationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INTRO_AD_MODERATION);
  }, [navigateFromProfileTab]);

  const handleSubscriptionsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_SUBSCRIPTIONS);
  }, [navigateFromProfileTab]);

  const handleWishlistFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_WISHLIST);
  }, [navigateFromProfileTab]);

  const handlePremiumPurchased = useCallback(
    async ({ loyaltyPointsBalance }) => {
      setLoyaltyPoints(loyaltyPointsBalance);
      await invalidateAuthMe();
    },
    [invalidateAuthMe, setLoyaltyPoints],
  );

  return {
    handleMyProductsFromProfile,

    handleMyOrdersFromProfile,

    handleMySalesFromProfile,

    handleInstallmentPaymentsFromProfile,

    handleInstallmentSalesFromProfile,

    handleInstallmentDisputesFromProfile,

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

    handleAuctionFromProfile,

    handleCourierFromProfile,
    handleCourierModerationFromProfile,
    handleShipmentDisputesFromProfile,
    handleCourierOverviewFromProfile,
    handleDataConfirmationQueueFromProfile,

    handleDataConfirmationFromProfile,

    handlePremiumFromProfile,

    handleLoyaltyPointsFromProfile,

    handlePartnerProgramFromProfile,

    handleAdvertisingFromProfile,

    handleOneCIntegrationFromProfile,

    handleEditProfileFromProfile,

    handleIntroAdModerationFromProfile,

    handleSellerPersonalCategoryModerationFromProfile,

    handleSubscriptionsFromProfile,

    handleWishlistFromProfile,

    handlePremiumPurchased,
  };
};
