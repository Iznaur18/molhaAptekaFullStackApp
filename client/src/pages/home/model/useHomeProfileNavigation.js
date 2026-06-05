import { useCallback } from "react";

import {
  PROFILE_TAB_ADMIN_ORDERS,
  PROFILE_TAB_SEARCH_SYNONYMS_ADMIN,
  PROFILE_TAB_CATEGORY_TREE_ADMIN,
  PROFILE_TAB_AUCTION,
  PROFILE_TAB_DATA_CONFIRMATION,
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

import { profileTabToMainView } from "../../my-profile/lib/profileTabToMainView.js";

import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";

/**

 * @param {{

 *   goToMainView: (view: import('../../../shared/lib/homeMainViewPaths.js').HomeMainView) => void;

 *   setMyProductsCatalogError: (message: string) => void;

 *   myProfilePage: { phase: string; user?: { _id?: string } | null };

 *   setLoyaltyPoints: (value: number) => void;

 *   setMyProfilePage: import('react').Dispatch<import('react').SetStateAction<object>>;

 * }} params

 */

export const useHomeProfileNavigation = ({
  goToMainView,

  setMyProductsCatalogError,

  myProfilePage,

  setLoyaltyPoints,

  setMyProfilePage,
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

  const handleInstallmentModerationFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_INSTALLMENT_MODERATION);
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

  const handleSubscriptionsFromProfile = useCallback(() => {
    navigateFromProfileTab(PROFILE_TAB_SUBSCRIPTIONS);
  }, [navigateFromProfileTab]);

  const handlePremiumPurchased = useCallback(
    async ({ loyaltyPointsBalance }) => {
      setLoyaltyPoints(loyaltyPointsBalance);

      try {
        const { user } = await fetchCurrentUserProfile();

        setMyProfilePage({ phase: "success", user, error: "" });
      } catch {
        /* профиль обновится при следующем заходе */
      }
    },

    [setLoyaltyPoints, setMyProfilePage],
  );

  return {
    handleMyProductsFromProfile,

    handleMyOrdersFromProfile,

    handleMySalesFromProfile,

    handleInstallmentPaymentsFromProfile,

    handleInstallmentSalesFromProfile,

    handleInstallmentModerationFromProfile,

    handleInstallmentDisputesFromProfile,

    handleAdminOrdersFromProfile,

    handleSearchSynonymsAdminFromProfile,

    handleCategoryTreeAdminFromProfile,

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
  };
};
