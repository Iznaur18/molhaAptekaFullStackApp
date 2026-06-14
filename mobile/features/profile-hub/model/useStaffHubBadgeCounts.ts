import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import {
  fetchIncomingPriceOffersPendingCount,
  fetchInstallmentBuyerActionCount,
  fetchInstallmentSellerActionCount,
  fetchMyOrdersActionCount,
  fetchMySalesActionCount,
  fetchPendingDataConfirmationCount,
  fetchPendingInstallmentDisputesCount,
  fetchPendingInstallmentModerationCount,
  fetchPendingIntroAdCampaignsCount,
  fetchPendingModerationProductsCount,
  fetchPendingProductPromotionsCount,
  fetchPendingRafflesCount,
  fetchPendingSellerPersonalCategoryCampaignsCount,
  fetchStaffProductReportsBadgeCount,
} from "@/features/profile-hub/api/staffBadgeApi";
import type { ProfileSectionId } from "@/features/profile-hub/model/profileSections";
import { staffBadgeQueryKeys } from "@/shared/api";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/shared/config";

import type { ProfileHubAccess } from "./useProfileHubAccess";

const BADGE_QUERY_OPTIONS = {
  staleTime: DEFAULT_QUERY_STALE_TIME_MS,
  retry: false,
};

export const useStaffHubBadgeCounts = (
  hubAccess: ProfileHubAccess,
): Partial<Record<ProfileSectionId, number>> => {
  const staffEnabled = hubAccess.isProfileReady && hubAccess.canUseProductModeration;
  const userActionsEnabled = hubAccess.isProfileReady;

  const queries = useQueries({
    queries: [
      {
        queryKey: [...staffBadgeQueryKeys.all, "moderation"],
        queryFn: fetchPendingModerationProductsCount,
        enabled: staffEnabled,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "intro-ad"],
        queryFn: fetchPendingIntroAdCampaignsCount,
        enabled: staffEnabled,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "seller-personal-category"],
        queryFn: fetchPendingSellerPersonalCategoryCampaignsCount,
        enabled: staffEnabled,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "product-reports"],
        queryFn: fetchStaffProductReportsBadgeCount,
        enabled: staffEnabled,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "data-confirmation"],
        queryFn: fetchPendingDataConfirmationCount,
        enabled: staffEnabled && hubAccess.canUseDataConfirmationQueue,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "raffles"],
        queryFn: fetchPendingRafflesCount,
        enabled: staffEnabled && hubAccess.canUseRaffles,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "product-promotions"],
        queryFn: fetchPendingProductPromotionsCount,
        enabled: staffEnabled && hubAccess.canUseProductPromotions,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "installment-moderation"],
        queryFn: fetchPendingInstallmentModerationCount,
        enabled: staffEnabled && hubAccess.canUseInstallmentModeration,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "installment-disputes"],
        queryFn: fetchPendingInstallmentDisputesCount,
        enabled: staffEnabled && hubAccess.canUseInstallmentDisputes,
        ...BADGE_QUERY_OPTIONS,
      },
      {
        queryKey: [...staffBadgeQueryKeys.all, "user-actions"],
        queryFn: async () => {
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
          return {
            auction: auctionCount,
            mySales: mySalesCount,
            myOrders: myOrdersCount,
            installmentPayments: installmentBuyerCount,
            installmentSales: installmentSellerCount,
          };
        },
        enabled: userActionsEnabled,
        ...BADGE_QUERY_OPTIONS,
      },
    ],
  });

  return useMemo(() => {
    const [
      moderationQuery,
      introAdQuery,
      sellerCategoryQuery,
      productReportsQuery,
      dataConfirmationQuery,
      rafflesQuery,
      productPromotionsQuery,
      installmentModerationQuery,
      installmentDisputesQuery,
      userActionsQuery,
    ] = queries;

    const userActions = userActionsQuery.data ?? {
      auction: 0,
      mySales: 0,
      myOrders: 0,
      installmentPayments: 0,
      installmentSales: 0,
    };

    const counts: Partial<Record<ProfileSectionId, number>> = {
      auction: userActions.auction,
      "my-sales": userActions.mySales,
      "my-orders": userActions.myOrders,
      "installment-payments": userActions.installmentPayments,
      "installment-sales": userActions.installmentSales,
    };

    if (staffEnabled) {
      counts["product-moderation"] = moderationQuery.data ?? 0;
      counts["intro-ad-moderation"] = introAdQuery.data ?? 0;
      counts["seller-personal-category-moderation"] = sellerCategoryQuery.data ?? 0;
      counts["product-reports"] = productReportsQuery.data ?? 0;
    }

    if (hubAccess.canUseDataConfirmationQueue) {
      counts["data-confirmation-requests"] = dataConfirmationQuery.data ?? 0;
    }

    if (hubAccess.canUseRaffles) {
      counts.raffles = rafflesQuery.data ?? 0;
    }

    if (hubAccess.canUseProductPromotions) {
      counts["product-promotions"] = productPromotionsQuery.data ?? 0;
    }

    if (hubAccess.canUseInstallmentModeration) {
      counts["installment-moderation"] = installmentModerationQuery.data ?? 0;
    }

    if (hubAccess.canUseInstallmentDisputes) {
      counts["installment-disputes"] = installmentDisputesQuery.data ?? 0;
    }

    return counts;
  }, [hubAccess, queries, staffEnabled]);
};
