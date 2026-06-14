import {
  approveSellerPersonalCategoryCampaignDataSchema,
  pendingSellerPersonalCategoryCampaignsDataSchema,
  rejectSellerPersonalCategoryCampaignDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchPendingSellerPersonalCategoryCampaigns = async (limit = 50) => {
  try {
    const { data } = await apiClient.get(
      "/seller-personal-category/moderation/pending",
      { params: { limit } },
    );
    const parsed = parseApiContractData(
      data,
      pendingSellerPersonalCategoryCampaignsDataSchema,
    );
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK),
    );
  }
};

export const approveSellerPersonalCategoryCampaign = async (campaignId: string) => {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/approve`,
    );
    parseApiContractData(data, approveSellerPersonalCategoryCampaignDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
      ),
    );
  }
};

export const rejectSellerPersonalCategoryCampaign = async (
  campaignId: string,
  reason = "",
) => {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/reject`,
      { reason: reason.trim() || null },
    );
    parseApiContractData(data, rejectSellerPersonalCategoryCampaignDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK,
      ),
    );
  }
};
