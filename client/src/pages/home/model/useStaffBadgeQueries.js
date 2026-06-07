import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  fetchInstallmentBuyerActionCount,
  fetchInstallmentSellerActionCount,
  fetchPendingInstallmentDisputesCount,
  fetchPendingInstallmentModerationCount,
} from "../../../entities/installment/api/installmentApi.js";
import { fetchMyOrdersActionCount } from "../../../entities/order/api/fetchMyOrdersActionCount.js";
import { fetchMySalesActionCount } from "../../../entities/order/api/fetchMySalesActionCount.js";
import { fetchIncomingPriceOffersPendingCount } from "../../../entities/product-price-offer/api/fetchIncomingPriceOffersPendingCount.js";
import { fetchPendingModerationProductsCount } from "../../../entities/product/api/fetchPendingModerationProductsCount.js";
import { fetchPendingProductReportsCount } from "../../../entities/product-report/api/fetchPendingProductReportsCount.js";
import { fetchPendingUserStoryReportsCount } from "../../../entities/user-story/api/fetchPendingUserStoryReportsCount.js";
import { fetchPendingDataConfirmationCount } from "../../../entities/user-data-confirmation/api/fetchPendingDataConfirmationCount.js";
import { fetchPendingRafflesCount } from "../../../entities/raffle/api/fetchPendingRafflesCount.js";
import { STAFF_BADGE_STALE_TIME_MS } from "../../../shared/api/queryClient.js";
import {
  resolveDataConfirmationStaffBadgeCount,
  resolveIncomingPriceOffersPendingCount,
  resolveInstallmentDisputesStaffBadgeCount,
  resolveInstallmentBuyerActionCount,
  resolveInstallmentSellerActionCount,
  resolveInstallmentModerationStaffBadgeCount,
  resolveModerationStaffBadgeCount,
  resolveMyOrdersActionCount,
  resolveMySalesActionCount,
  resolveProductReportsStaffBadgeCount,
  resolveRafflesStaffBadgeCount,
} from "../lib/staffBadgeCountResolvers.js";
import {
  invalidateAllStaffBadges,
  syncDataConfirmationQueueCaches,
  syncInstallmentDisputesQueueCaches,
  syncInstallmentModerationQueueCaches,
  syncModerationQueueCaches,
  syncProductReportsQueueCaches,
  syncRafflesStaffQueueCaches,
  syncUserProfileActionCaches,
} from "../lib/staffBadgeQueryCache.js";

import { staffBadgeQueryKeys } from "./staffBadgeQueryKeys.js";

const STAFF_MODERATOR_QUERY_OPTIONS = {
  staleTime: STAFF_BADGE_STALE_TIME_MS,
  retry: false,
};

/**
 * @param {{
 *   isAuthorized: boolean;
 *   canModerateProducts: boolean;
 *   mainView: string;
 * }} params
 */
export function useStaffBadgeQueries({
  isAuthorized,
  canModerateProducts,
  mainView,
}) {
  const queryClient = useQueryClient();
  const staffEnabled = isAuthorized && canModerateProducts;
  const userActionsEnabled = isAuthorized;

  const queries = useQueries({
    queries: [
      {
        queryKey: [...staffBadgeQueryKeys.moderation, mainView],
        queryFn: () =>
          resolveModerationStaffBadgeCount(
            queryClient,
            fetchPendingModerationProductsCount,
          ),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.productReports, mainView],
        queryFn: () =>
          resolveProductReportsStaffBadgeCount(
            queryClient,
            fetchPendingProductReportsCount,
            fetchPendingUserStoryReportsCount,
          ),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.dataConfirmation, mainView],
        queryFn: () =>
          resolveDataConfirmationStaffBadgeCount(
            queryClient,
            fetchPendingDataConfirmationCount,
          ),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.raffles, mainView],
        queryFn: () =>
          resolveRafflesStaffBadgeCount(queryClient, fetchPendingRafflesCount),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.installmentModeration, mainView],
        queryFn: () =>
          resolveInstallmentModerationStaffBadgeCount(
            queryClient,
            fetchPendingInstallmentModerationCount,
          ),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.installmentDisputes, mainView],
        queryFn: () =>
          resolveInstallmentDisputesStaffBadgeCount(
            queryClient,
            fetchPendingInstallmentDisputesCount,
          ),
        enabled: staffEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.userProfileActions, mainView],
        queryFn: async () => {
          const [
            auctionCount,
            mySalesCount,
            myOrdersCount,
            installmentBuyerCount,
            installmentSellerCount,
          ] = await Promise.all([
            resolveIncomingPriceOffersPendingCount(
              queryClient,
              fetchIncomingPriceOffersPendingCount,
            ),
            resolveMySalesActionCount(queryClient, fetchMySalesActionCount),
            resolveMyOrdersActionCount(queryClient, fetchMyOrdersActionCount),
            resolveInstallmentBuyerActionCount(
              queryClient,
              fetchInstallmentBuyerActionCount,
            ),
            resolveInstallmentSellerActionCount(
              queryClient,
              fetchInstallmentSellerActionCount,
            ),
          ]);
          return {
            pendingIncomingPriceOffersCount: auctionCount,
            pendingMySalesActionCount: mySalesCount,
            pendingMyOrdersActionCount: myOrdersCount,
            pendingInstallmentBuyerActionCount: installmentBuyerCount,
            pendingInstallmentSellerActionCount: installmentSellerCount,
          };
        },
        enabled: userActionsEnabled,
        ...STAFF_MODERATOR_QUERY_OPTIONS,
      },
    ],
  });

  const [
    moderationQuery,
    productReportsQuery,
    dataConfirmationQuery,
    rafflesQuery,
    installmentModerationQuery,
    installmentDisputesQuery,
    userProfileActionsQuery,
  ] = queries;

  const userProfileActions = userProfileActionsQuery.data ?? {
    pendingIncomingPriceOffersCount: 0,
    pendingMySalesActionCount: 0,
    pendingMyOrdersActionCount: 0,
    pendingInstallmentBuyerActionCount: 0,
    pendingInstallmentSellerActionCount: 0,
  };

  const invalidateStaffBadges = useCallback(() => {
    return invalidateAllStaffBadges(queryClient);
  }, [queryClient]);

  const refreshFns = useMemo(
    () => ({
      refreshPendingModerationCount: () => syncModerationQueueCaches(queryClient),
      refreshPendingProductReportsCount: () =>
        syncProductReportsQueueCaches(queryClient),
      refreshPendingDataConfirmationCount: () =>
        syncDataConfirmationQueueCaches(queryClient),
      refreshPendingRafflesCount: () => syncRafflesStaffQueueCaches(queryClient),
      refreshPendingInstallmentModerationCount: () =>
        syncInstallmentModerationQueueCaches(queryClient),
      refreshPendingInstallmentDisputesCount: () =>
        syncInstallmentDisputesQueueCaches(queryClient),
      refreshUserProfileActionBadgeCounts: () =>
        syncUserProfileActionCaches(queryClient),
    }),
    [queryClient],
  );

  return {
    pendingModerationCount: moderationQuery.data ?? 0,
    pendingProductReportsCount: productReportsQuery.data ?? 0,
    pendingDataConfirmationCount: dataConfirmationQuery.data ?? 0,
    pendingRafflesCount: rafflesQuery.data ?? 0,
    pendingInstallmentModerationCount: installmentModerationQuery.data ?? 0,
    pendingInstallmentDisputesCount: installmentDisputesQuery.data ?? 0,
    pendingIncomingPriceOffersCount:
      userProfileActions.pendingIncomingPriceOffersCount,
    pendingMySalesActionCount: userProfileActions.pendingMySalesActionCount,
    pendingMyOrdersActionCount: userProfileActions.pendingMyOrdersActionCount,
    pendingInstallmentBuyerActionCount:
      userProfileActions.pendingInstallmentBuyerActionCount,
    pendingInstallmentSellerActionCount:
      userProfileActions.pendingInstallmentSellerActionCount,
    invalidateStaffBadges,
    ...refreshFns,
  };
}
