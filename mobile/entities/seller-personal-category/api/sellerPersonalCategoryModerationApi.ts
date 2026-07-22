import {
  approveSellerPersonalCategoryCampaignDataSchema,
  managedSellerPersonalCategoryCampaignsDataSchema,
  pendingSellerPersonalCategoryCampaignsDataSchema,
  rejectSellerPersonalCategoryCampaignDataSchema,
  staffSellerPersonalCategoryCampaignActionDataSchema,
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

export const fetchManagedSellerPersonalCategoryCampaigns = async () => {
  try {
    const { data } = await apiClient.get("/seller-personal-category/moderation/managed");
    const parsed = parseApiContractData(
      data,
      managedSellerPersonalCategoryCampaignsDataSchema,
    );
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK,
      ),
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
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK,
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
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK,
      ),
    );
  }
};

export const cancelSellerPersonalCategoryCampaignByStaff = async (campaignId: string) => {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/cancel`,
    );
    parseApiContractData(data, staffSellerPersonalCategoryCampaignActionDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH_FALLBACK,
      ),
    );
  }
};

export const deleteSellerPersonalCategoryCampaignByStaff = async (campaignId: string) => {
  try {
    const { data } = await apiClient.delete(
      `/seller-personal-category/moderation/${campaignId}/staff`,
    );
    parseApiContractData(data, staffSellerPersonalCategoryCampaignActionDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE_FALLBACK,
      ),
    );
  }
};
