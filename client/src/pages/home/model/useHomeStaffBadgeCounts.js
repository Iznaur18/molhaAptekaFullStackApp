import { useCallback, useEffect, useState } from "react";

import {
  fetchPendingInstallmentDisputesCount,
  fetchPendingInstallmentModerationCount,
  fetchInstallmentBuyerActionCount,
  fetchInstallmentSellerActionCount,
} from "../../../entities/installment/api/installmentApi.js";
import { fetchMyOrdersActionCount } from "../../../entities/order/api/fetchMyOrdersActionCount.js";
import { fetchMySalesActionCount } from "../../../entities/order/api/fetchMySalesActionCount.js";
import { fetchIncomingPriceOffersPendingCount } from "../../../entities/product-price-offer/api/fetchIncomingPriceOffersPendingCount.js";
import { fetchPendingModerationProductsCount } from "../../../entities/product/api/fetchPendingModerationProductsCount.js";
import { fetchPendingProductReportsCount } from "../../../entities/product-report/api/fetchPendingProductReportsCount.js";
import { fetchPendingUserStoryReportsCount } from "../../../entities/user-story/api/fetchPendingUserStoryReportsCount.js";
import { fetchPendingDataConfirmationCount } from "../../../entities/user-data-confirmation/api/fetchPendingDataConfirmationCount.js";
import { fetchPendingRafflesCount } from "../../../entities/raffle/api/fetchPendingRafflesCount.js";

/**
 * @param {{
 *   isAuthorized: boolean;
 *   canModerateProducts: boolean;
 *   mainView: string;
 * }} params
 */
export const useHomeStaffBadgeCounts = ({
  isAuthorized,
  canModerateProducts,
  mainView,
}) => {
  const [pendingModerationCount, setPendingModerationCount] = useState(0);
  const [pendingProductReportsCount, setPendingProductReportsCount] = useState(0);
  const [pendingDataConfirmationCount, setPendingDataConfirmationCount] = useState(0);
  const [pendingRafflesCount, setPendingRafflesCount] = useState(0);
  const [pendingInstallmentModerationCount, setPendingInstallmentModerationCount] =
    useState(0);
  const [pendingInstallmentDisputesCount, setPendingInstallmentDisputesCount] =
    useState(0);
  const [pendingIncomingPriceOffersCount, setPendingIncomingPriceOffersCount] =
    useState(0);
  const [pendingMySalesActionCount, setPendingMySalesActionCount] = useState(0);
  const [pendingMyOrdersActionCount, setPendingMyOrdersActionCount] = useState(0);
  const [pendingInstallmentBuyerActionCount, setPendingInstallmentBuyerActionCount] =
    useState(0);
  const [pendingInstallmentSellerActionCount, setPendingInstallmentSellerActionCount] =
    useState(0);

  const refreshPendingModerationCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingModerationCount(0);
      return;
    }
    try {
      const count = await fetchPendingModerationProductsCount();
      setPendingModerationCount(count);
    } catch {
      setPendingModerationCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingModerationCount();
  }, [refreshPendingModerationCount, mainView]);

  const refreshPendingProductReportsCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingProductReportsCount(0);
      return;
    }
    try {
      const [productCount, storyCount] = await Promise.all([
        fetchPendingProductReportsCount(),
        fetchPendingUserStoryReportsCount(),
      ]);
      setPendingProductReportsCount(productCount + storyCount);
    } catch {
      setPendingProductReportsCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingProductReportsCount();
  }, [refreshPendingProductReportsCount, mainView]);

  const refreshPendingDataConfirmationCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingDataConfirmationCount(0);
      return;
    }
    try {
      const count = await fetchPendingDataConfirmationCount();
      setPendingDataConfirmationCount(count);
    } catch {
      setPendingDataConfirmationCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingDataConfirmationCount();
  }, [refreshPendingDataConfirmationCount, mainView]);

  const refreshPendingRafflesCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingRafflesCount(0);
      return;
    }
    try {
      const count = await fetchPendingRafflesCount();
      setPendingRafflesCount(count);
    } catch {
      setPendingRafflesCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingRafflesCount();
  }, [refreshPendingRafflesCount, mainView]);

  const refreshPendingInstallmentModerationCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingInstallmentModerationCount(0);
      return;
    }
    try {
      const count = await fetchPendingInstallmentModerationCount();
      setPendingInstallmentModerationCount(count);
    } catch {
      setPendingInstallmentModerationCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingInstallmentModerationCount();
  }, [refreshPendingInstallmentModerationCount, mainView]);

  const refreshPendingInstallmentDisputesCount = useCallback(async () => {
    if (!canModerateProducts || !isAuthorized) {
      setPendingInstallmentDisputesCount(0);
      return;
    }
    try {
      const count = await fetchPendingInstallmentDisputesCount();
      setPendingInstallmentDisputesCount(count);
    } catch {
      setPendingInstallmentDisputesCount(0);
    }
  }, [canModerateProducts, isAuthorized]);

  useEffect(() => {
    void refreshPendingInstallmentDisputesCount();
  }, [refreshPendingInstallmentDisputesCount, mainView]);

  const refreshUserProfileActionBadgeCounts = useCallback(async () => {
    if (!isAuthorized) {
      setPendingIncomingPriceOffersCount(0);
      setPendingMySalesActionCount(0);
      setPendingMyOrdersActionCount(0);
      setPendingInstallmentBuyerActionCount(0);
      setPendingInstallmentSellerActionCount(0);
      return;
    }
    try {
      const [
        auctionCount,
        mySalesCount,
        myOrdersCount,
        installmentBuyerCount,
        installmentSellerCount,
      ] = await Promise.all([
        fetchIncomingPriceOffersPendingCount(),
        fetchMySalesActionCount(),
        fetchMyOrdersActionCount(),
        fetchInstallmentBuyerActionCount(),
        fetchInstallmentSellerActionCount(),
      ]);
      setPendingIncomingPriceOffersCount(auctionCount);
      setPendingMySalesActionCount(mySalesCount);
      setPendingMyOrdersActionCount(myOrdersCount);
      setPendingInstallmentBuyerActionCount(installmentBuyerCount);
      setPendingInstallmentSellerActionCount(installmentSellerCount);
    } catch {
      setPendingIncomingPriceOffersCount(0);
      setPendingMySalesActionCount(0);
      setPendingMyOrdersActionCount(0);
      setPendingInstallmentBuyerActionCount(0);
      setPendingInstallmentSellerActionCount(0);
    }
  }, [isAuthorized]);

  useEffect(() => {
    void refreshUserProfileActionBadgeCounts();
  }, [refreshUserProfileActionBadgeCounts, mainView, isAuthorized]);

  return {
    pendingModerationCount,
    pendingProductReportsCount,
    pendingDataConfirmationCount,
    pendingRafflesCount,
    pendingInstallmentModerationCount,
    pendingInstallmentDisputesCount,
    pendingIncomingPriceOffersCount,
    pendingMySalesActionCount,
    pendingMyOrdersActionCount,
    pendingInstallmentBuyerActionCount,
    pendingInstallmentSellerActionCount,
    refreshPendingModerationCount,
    refreshPendingProductReportsCount,
    refreshPendingDataConfirmationCount,
    refreshPendingRafflesCount,
    refreshPendingInstallmentModerationCount,
    refreshPendingInstallmentDisputesCount,
    refreshUserProfileActionBadgeCounts,
  };
};
