import { introAdQueryKeys } from "../../../entities/intro-ad/model/introAdQueryKeys.js";
import { sellerPersonalCategoryQueryKeys } from "../../../entities/seller-personal-category/model/sellerPersonalCategoryQueryKeys.js";
import { installmentQueryKeys } from "../../../entities/installment/model/installmentQueryKeys.js";
import {
  countMyOrdersActionItemsFromOrders,
  countMySalesActionItemsFromOrders,
  isCompleteMySalesPageCache,
  readMySalesOrdersFromCache,
} from "../../../entities/order/lib/countOrderActionItems.js";
import { orderQueryKeys } from "../../../entities/order/model/orderQueryKeys.js";
import { moderationQueryKeys } from "../../../entities/product/model/moderationQueryKeys.js";
import { priceOfferQueryKeys } from "../../../entities/product-price-offer/model/priceOfferQueryKeys.js";
import { productReportQueryKeys } from "../../../entities/product-report/model/productReportQueryKeys.js";
import { productPromotionQueryKeys } from "../../../entities/product-promotion/model/productPromotionQueryKeys.js";
import { raffleQueryKeys } from "../../../entities/raffle/model/raffleQueryKeys.js";
import { pendingDataConfirmationQueryKeys } from "../../../entities/user-data-confirmation/model/pendingDataConfirmationQueryKeys.js";
import { userStoryReportQueryKeys } from "../../../entities/user-story/model/userStoryReportQueryKeys.js";
import { STAFF_BADGE_STALE_TIME_MS } from "../../../shared/api/queryClient.js";

const MODERATION_BADGE_LIST_LIMIT = 100;
const INTRO_AD_MODERATION_BADGE_LIST_LIMIT = 50;
const PRICE_OFFER_STATUS_PENDING = "pending";

const STAFF_BADGE_COUNT_QUERY_OPTIONS = {
  staleTime: STAFF_BADGE_STALE_TIME_MS,
  retry: false,
};

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {readonly unknown[]} queryKey
 */
function readSuccessfulQueryData(queryClient, queryKey) {
  const state = queryClient.getQueryState(queryKey);
  if (state?.status !== "success" || state.data === undefined) {
    return undefined;
  }
  return state.data;
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {readonly unknown[]} countQueryKey
 * @param {() => number | undefined} resolveFromCache
 * @param {() => Promise<number>} fetchCount
 */
async function resolveStaffBadgeCount(
  queryClient,
  countQueryKey,
  resolveFromCache,
  fetchCount,
) {
  const cachedCount = resolveFromCache(queryClient);
  if (typeof cachedCount === "number") {
    return cachedCount;
  }

  return queryClient.fetchQuery({
    queryKey: countQueryKey,
    queryFn: fetchCount,
    ...STAFF_BADGE_COUNT_QUERY_OPTIONS,
  });
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveModerationStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    moderationQueryKeys.count(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        moderationQueryKeys.pending({ limit: MODERATION_BADGE_LIST_LIMIT }),
      );
      return typeof cached?.total === "number" ? cached.total : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchProductReportsCount
 * @param {() => Promise<number>} fetchStoryReportsCount
 */
export function resolveProductReportsStaffBadgeCount(
  queryClient,
  fetchProductReportsCount,
  fetchStoryReportsCount,
) {
  const cachedCount = (() => {
    const productReports = readSuccessfulQueryData(
      queryClient,
      productReportQueryKeys.pending(),
    );
    const storyReports = readSuccessfulQueryData(
      queryClient,
      userStoryReportQueryKeys.pending(),
    );
    if (
      typeof productReports?.totalReports !== "number" &&
      typeof storyReports?.totalReports !== "number"
    ) {
      return undefined;
    }
    return (productReports?.totalReports ?? 0) + (storyReports?.totalReports ?? 0);
  })();

  if (typeof cachedCount === "number") {
    return Promise.resolve(cachedCount);
  }

  return Promise.all([
    queryClient.fetchQuery({
      queryKey: productReportQueryKeys.pendingCount(),
      queryFn: fetchProductReportsCount,
      ...STAFF_BADGE_COUNT_QUERY_OPTIONS,
    }),
    queryClient.fetchQuery({
      queryKey: userStoryReportQueryKeys.pendingCount(),
      queryFn: fetchStoryReportsCount,
      ...STAFF_BADGE_COUNT_QUERY_OPTIONS,
    }),
  ]).then(([productCount, storyCount]) => productCount + storyCount);
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveDataConfirmationStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    pendingDataConfirmationQueryKeys.count(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        pendingDataConfirmationQueryKeys.all,
      );
      return Array.isArray(cached) ? cached.length : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveRafflesStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    raffleQueryKeys.staffPendingCount(),
    (client) => {
      const cached = readSuccessfulQueryData(client, raffleQueryKeys.staffQueue());
      return Array.isArray(cached?.pendingRaffles)
        ? cached.pendingRaffles.length
        : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveProductPromotionsStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    productPromotionQueryKeys.staffPendingCount(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        productPromotionQueryKeys.staffPending(),
      );
      return Array.isArray(cached) ? cached.length : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveInstallmentModerationStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    installmentQueryKeys.moderationPendingCount(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        installmentQueryKeys.moderationPending(),
      );
      return Array.isArray(cached?.programs) ? cached.programs.length : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveInstallmentDisputesStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    installmentQueryKeys.disputesPendingCount(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        installmentQueryKeys.disputesPending(),
      );
      return Array.isArray(cached) ? cached.length : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveIncomingPriceOffersPendingCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    priceOfferQueryKeys.incomingPendingCount(),
    (client) => {
      const cached = readSuccessfulQueryData(client, priceOfferQueryKeys.incoming());
      if (!Array.isArray(cached)) {
        return undefined;
      }
      return cached.filter((row) => row.status === PRICE_OFFER_STATUS_PENDING).length;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveMyOrdersActionCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    orderQueryKeys.myActionCount(),
    (client) => {
      const cached = readSuccessfulQueryData(client, orderQueryKeys.my());
      return Array.isArray(cached)
        ? countMyOrdersActionItemsFromOrders(cached)
        : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveMySalesActionCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    orderQueryKeys.salesActionCount(),
    (client) => {
      const cached = readSuccessfulQueryData(client, orderQueryKeys.sales({}));
      if (!isCompleteMySalesPageCache(cached)) {
        return undefined;
      }
      const orders = readMySalesOrdersFromCache(cached);
      return orders ? countMySalesActionItemsFromOrders(orders) : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveInstallmentBuyerActionCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    installmentQueryKeys.buyerActionCount(),
    () => undefined,
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveInstallmentSellerActionCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    installmentQueryKeys.sellerActionCount(),
    () => undefined,
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveIntroAdModerationStaffBadgeCount(queryClient, fetchCount) {
  return resolveStaffBadgeCount(
    queryClient,
    introAdQueryKeys.moderationCount(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        introAdQueryKeys.moderationPending(INTRO_AD_MODERATION_BADGE_LIST_LIMIT),
      );
      return Array.isArray(cached?.campaigns) ? cached.campaigns.length : undefined;
    },
    fetchCount,
  );
}

/**
 * @param {import('@tanstack/react-query').QueryClient} queryClient
 * @param {() => Promise<number>} fetchCount
 */
export function resolveSellerPersonalCategoryModerationStaffBadgeCount(
  queryClient,
  fetchCount,
) {
  return resolveStaffBadgeCount(
    queryClient,
    sellerPersonalCategoryQueryKeys.moderationCount(),
    (client) => {
      const cached = readSuccessfulQueryData(
        client,
        sellerPersonalCategoryQueryKeys.moderationPending(),
      );
      return Array.isArray(cached) ? cached.length : undefined;
    },
    fetchCount,
  );
}
