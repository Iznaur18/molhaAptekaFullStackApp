import {
  pendingIntroAdCampaignsCountDataSchema,
  pendingSellerPersonalCategoryCampaignsCountDataSchema,
} from "@molha/api-contract";

import { fetchPendingSiteHeaderBannerCampaignsCount } from "@/entities/site-header-banner-campaign/api/siteHeaderBannerCampaignModerationApi";
import { apiClient, parseApiContractData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

const fetchCount = async (path: string, field: string): Promise<number> => {
  try {
    const { data } = await apiClient.get(path);
    if (!data?.success) {
      return 0;
    }
    const raw = data.data?.[field];
    return typeof raw === "number" ? raw : Number(raw) || 0;
  } catch {
    return 0;
  }
};

export const fetchPendingModerationProductsCount = () =>
  fetchCount("/product/moderation/pending/count", "totalPending");

export const fetchPendingIntroAdCampaignsOnlyCount = async (): Promise<number> => {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/pending/count");
    const parsed = parseApiContractData(data, pendingIntroAdCampaignsCountDataSchema);
    return parsed.count;
  } catch {
    return 0;
  }
};

export const fetchPendingSellerPersonalCategoryCampaignsCount = async (): Promise<number> => {
  try {
    const { data } = await apiClient.get(
      "/seller-personal-category/moderation/pending/count",
    );
    const parsed = parseApiContractData(
      data,
      pendingSellerPersonalCategoryCampaignsCountDataSchema,
    );
    return parsed.count;
  } catch {
    return 0;
  }
};

export const fetchPendingAdModerationNavBadgeCount = async (): Promise<number> => {
  const [introCount, bannerCount, personalCategoryCount] = await Promise.all([
    fetchPendingIntroAdCampaignsOnlyCount(),
    fetchPendingSiteHeaderBannerCampaignsCount(),
    fetchPendingSellerPersonalCategoryCampaignsCount(),
  ]);
  return introCount + bannerCount + personalCategoryCount;
};

/** @deprecated используйте fetchPendingIntroAdCampaignsOnlyCount или fetchPendingAdModerationNavBadgeCount */
export const fetchPendingIntroAdCampaignsCount = fetchPendingAdModerationNavBadgeCount;

export const fetchPendingProductReportsCount = () =>
  fetchCount("/product/reports/pending/count", "count");

export const fetchPendingUserStoryReportsCount = () =>
  fetchCount("/user/stories/reports/pending/count", "count");

export const fetchPendingDataConfirmationCount = () =>
  fetchCount("/user/data-confirmation-requests/pending/count", "count");

export const fetchPendingRafflesCount = () =>
  fetchCount("/product/raffles/pending/count", "count");

export const fetchPendingProductPromotionsCount = () =>
  fetchCount("/product/promotions/pending/count", "count");

export const fetchPendingInstallmentDisputesCount = () =>
  fetchCount("/installment/disputes/pending/count", "count");

export const fetchIncomingPriceOffersPendingCount = () =>
  fetchCount("/price-offers/incoming/pending-count", "count");

export const fetchMySalesActionCount = () => fetchCount("/order/sales/action-count", "count");

export const fetchMyOrdersActionCount = () => fetchCount("/order/action-count", "count");

export const fetchInstallmentBuyerActionCount = () =>
  fetchCount("/installment/contracts/my/action-count", "count");

export const fetchInstallmentSellerActionCount = () =>
  fetchCount("/installment/contracts/sales/action-count", "count");

export const fetchStaffProductReportsBadgeCount = async () => {
  try {
    const [productCount, storyCount] = await Promise.all([
      fetchPendingProductReportsCount(),
      fetchPendingUserStoryReportsCount(),
    ]);
    return productCount + storyCount;
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.INVALID_SERVER_RESPONSE));
  }
};
