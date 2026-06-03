import { useCallback } from "react";

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
import { fetchCurrentUserProfile } from "../../../entities/user/api/fetchCurrentUserProfile.js";

/**
 * @param {{
 *   setMyProfileTab: (tab: string) => void;
 *   setMyProductsCatalogError: (message: string) => void;
 *   myProfilePage: { phase: string; user?: { _id?: string } | null };
 *   setIsDataConfirmationModalOpen: (open: boolean) => void;
 *   setLoyaltyPoints: (value: number) => void;
 *   setMyProfilePage: import('react').Dispatch<import('react').SetStateAction<object>>;
 * }} params
 */
export const useHomeProfileNavigation = ({
  setMyProfileTab,
  setMyProductsCatalogError,
  myProfilePage,
  setIsDataConfirmationModalOpen,
  setLoyaltyPoints,
  setMyProfilePage,
}) => {
  const handleMyProductsFromProfile = useCallback(() => {
    if (myProfilePage.phase !== "success" || !myProfilePage.user?._id) {
      return;
    }
    setMyProductsCatalogError("");
    setMyProfileTab(PROFILE_TAB_MY_PRODUCTS);
  }, [myProfilePage, setMyProductsCatalogError, setMyProfileTab]);

  const handleMyOrdersFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_MY_ORDERS);
  }, [setMyProfileTab]);

  const handleMySalesFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_MY_SALES);
  }, [setMyProfileTab]);

  const handleInstallmentPaymentsFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_INSTALLMENT_PAYMENTS);
  }, [setMyProfileTab]);

  const handleInstallmentSalesFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_INSTALLMENT_SALES);
  }, [setMyProfileTab]);

  const handleInstallmentModerationFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_INSTALLMENT_MODERATION);
  }, [setMyProfileTab]);

  const handleInstallmentDisputesFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_INSTALLMENT_DISPUTES);
  }, [setMyProfileTab]);

  const handleAdminOrdersFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_ADMIN_ORDERS);
  }, [setMyProfileTab]);

  const handleProductModerationFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_MODERATION);
  }, [setMyProfileTab]);

  const handleProductReportsFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_REPORTS);
  }, [setMyProfileTab]);

  const handleProductPromotionsFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_PRODUCT_PROMOTIONS);
  }, [setMyProfileTab]);

  const handleRafflesFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_RAFFLES);
  }, [setMyProfileTab]);

  const handleAuctionFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_AUCTION);
  }, [setMyProfileTab]);

  const handleDataConfirmationQueueFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_DATA_CONFIRMATION_REQUESTS);
  }, [setMyProfileTab]);

  const handleDataConfirmationFromProfile = useCallback(() => {
    setIsDataConfirmationModalOpen(true);
  }, [setIsDataConfirmationModalOpen]);

  const handlePremiumFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_PREMIUM);
  }, [setMyProfileTab]);

  const handleLoyaltyPointsFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_LOYALTY_POINTS);
  }, [setMyProfileTab]);

  const handleSubscriptionsFromProfile = useCallback(() => {
    setMyProfileTab(PROFILE_TAB_SUBSCRIPTIONS);
  }, [setMyProfileTab]);

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
