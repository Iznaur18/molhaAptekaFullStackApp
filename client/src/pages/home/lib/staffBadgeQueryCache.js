import { invalidateInstallmentUserActionCounts } from "../../../entities/installment/lib/installmentQueryCache.js";
import { invalidateOrderActionCounts, invalidateMyOrders, invalidateMySalesOrders } from "../../../entities/order/lib/orderQueryCache.js";
import { invalidateIncomingPriceOffers } from "../../../entities/product-price-offer/lib/priceOfferQueryCache.js";
import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import { moderationQueryKeys } from "../../../entities/product/model/moderationQueryKeys.js";
import { productReportQueryKeys } from "../../../entities/product-report/model/productReportQueryKeys.js";
import { raffleQueryKeys } from "../../../entities/raffle/model/raffleQueryKeys.js";
import { pendingDataConfirmationQueryKeys } from "../../../entities/user-data-confirmation/model/pendingDataConfirmationQueryKeys.js";
import { userStoryReportQueryKeys } from "../../../entities/user-story/model/userStoryReportQueryKeys.js";

import { staffBadgeQueryKeys } from "../model/staffBadgeQueryKeys.js";

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateAllStaffBadges(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.moderation }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.productReports }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.dataConfirmation }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.raffles }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.installmentModeration }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.installmentDisputes }),
    queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.userProfileActions }),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateModerationStaffBadge(queryClient) {
  return queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.moderation });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateProductReportsStaffBadge(queryClient) {
  return queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.productReports });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateDataConfirmationStaffBadge(queryClient) {
  return queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.dataConfirmation });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateRafflesStaffBadge(queryClient) {
  return queryClient.invalidateQueries({ queryKey: staffBadgeQueryKeys.raffles });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateInstallmentModerationStaffBadge(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: staffBadgeQueryKeys.installmentModeration,
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateInstallmentDisputesStaffBadge(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: staffBadgeQueryKeys.installmentDisputes,
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export function invalidateUserProfileActionBadges(queryClient) {
  return queryClient.invalidateQueries({
    queryKey: staffBadgeQueryKeys.userProfileActions,
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncModerationQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: moderationQueryKeys.all }),
    invalidateModerationStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncProductReportsQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: productReportQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: userStoryReportQueryKeys.all }),
    invalidateProductReportsStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncDataConfirmationQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: pendingDataConfirmationQueryKeys.all }),
    invalidateDataConfirmationStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncRafflesStaffQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: raffleQueryKeys.staffQueue() }),
    invalidateRafflesStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncInstallmentModerationQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: installmentQueryKeys.moderationPending() }),
    invalidateInstallmentModerationStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncInstallmentDisputesQueueCaches(queryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: installmentQueryKeys.disputesPending() }),
    invalidateInstallmentDisputesStaffBadge(queryClient),
  ]);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 */
export async function syncUserProfileActionCaches(queryClient) {
  await Promise.all([
    invalidateMyOrders(queryClient),
    invalidateMySalesOrders(queryClient),
    invalidateIncomingPriceOffers(queryClient),
    queryClient.invalidateQueries({
      queryKey: [...installmentQueryKeys.all, "my-contracts"],
    }),
    queryClient.invalidateQueries({
      queryKey: [...installmentQueryKeys.all, "my-sales"],
    }),
    invalidateInstallmentUserActionCounts(queryClient),
    invalidateOrderActionCounts(queryClient),
    invalidateUserProfileActionBadges(queryClient),
  ]);
}
