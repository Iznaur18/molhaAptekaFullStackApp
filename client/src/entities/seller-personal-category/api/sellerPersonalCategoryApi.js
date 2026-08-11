import {
  approveSellerPersonalCategoryCampaignDataSchema,
  cancelSellerPersonalCategoryCampaignDataSchema,
  managedSellerPersonalCategoryCampaignsDataSchema,
  mySellerPersonalCategoryCampaignDataSchema,
  pendingSellerPersonalCategoryCampaignsCountDataSchema,
  pendingSellerPersonalCategoryCampaignsDataSchema,
  rejectSellerPersonalCategoryCampaignDataSchema,
  sellerPersonalCategoryCatalogTilesDataSchema,
  staffSellerPersonalCategoryCampaignActionDataSchema,
  submitSellerPersonalCategoryCampaignBodySchema,
  submitSellerPersonalCategoryCampaignDataSchema,
} from "@molha/api-contract";

import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import {
  SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI,
  SELLER_PERSONAL_CATEGORY_PAGE_UI,
} from "../../../shared/config/appUiCopy.js";

/**
 * @param {Record<string, unknown>} body
 */
export async function submitSellerPersonalCategoryCampaign(body) {
  try {
    const parsedBody = submitSellerPersonalCategoryCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/seller-personal-category", parsedBody);
    const parsed = parseApiContractData(data, submitSellerPersonalCategoryCampaignDataSchema);
    return {
      message: parsed.message,
      campaign: parsed.campaign,
      loyaltyPointsBalance: parsed.loyaltyPointsBalance ?? null,
    };
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_FALLBACK),
    );
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelSellerPersonalCategoryCampaign(campaignId) {
  try {
    const { data } = await apiClient.delete(`/seller-personal-category/${campaignId}`);
    const parsed = parseApiContractData(
      data,
      cancelSellerPersonalCategoryCampaignDataSchema,
    );
    return { message: parsed.message };
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_FALLBACK),
    );
  }
}

export async function fetchMySellerPersonalCategoryCampaign() {
  try {
    const { data } = await apiClient.get("/seller-personal-category/me");
    return parseApiContractData(data, mySellerPersonalCategoryCampaignDataSchema);
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_FALLBACK),
    );
  }
}

export async function fetchSellerPersonalCategoryCatalogTiles({ regionCode } = {}) {
  try {
    const { data } = await apiClient.get("/seller-personal-category/catalog-tiles", {
      params: regionCode ? { regionCode } : undefined,
    });
    return parseApiContractData(data, sellerPersonalCategoryCatalogTilesDataSchema);
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_TILES_FALLBACK),
    );
  }
}

export async function fetchPendingSellerPersonalCategoryCampaignsCount() {
  try {
    const { data } = await apiClient.get(
      "/seller-personal-category/moderation/pending/count",
    );
    const parsed = parseApiContractData(
      data,
      pendingSellerPersonalCategoryCampaignsCountDataSchema,
    );
    return parsed.count;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK),
    );
  }
}

export async function fetchPendingSellerPersonalCategoryCampaigns(limit = 50) {
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
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.FETCH_FALLBACK),
    );
  }
}

/**
 * @param {string} campaignId
 */
export async function approveSellerPersonalCategoryCampaign(campaignId) {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/approve`,
    );
    const parsed = parseApiContractData(
      data,
      approveSellerPersonalCategoryCampaignDataSchema,
    );
    return parsed.message;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.APPROVE_FALLBACK),
    );
  }
}

/**
 * @param {string} campaignId
 * @param {string} [reason]
 */
export async function rejectSellerPersonalCategoryCampaign(campaignId, reason = "") {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/reject`,
      { reason: reason.trim() || null },
    );
    const parsed = parseApiContractData(
      data,
      rejectSellerPersonalCategoryCampaignDataSchema,
    );
    return parsed.message;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.REJECT_FALLBACK),
    );
  }
}

export async function fetchManagedSellerPersonalCategoryCampaigns() {
  try {
    const { data } = await apiClient.get("/seller-personal-category/moderation/managed");
    const parsed = parseApiContractData(
      data,
      managedSellerPersonalCategoryCampaignsDataSchema,
    );
    return parsed.campaigns;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(
        e,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK,
      ),
    );
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelSellerPersonalCategoryCampaignByStaff(campaignId) {
  try {
    const { data } = await apiClient.post(
      `/seller-personal-category/moderation/${campaignId}/cancel`,
    );
    const parsed = parseApiContractData(
      data,
      staffSellerPersonalCategoryCampaignActionDataSchema,
    );
    return parsed.message;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(
        e,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_UNPUBLISH_FALLBACK,
      ),
    );
  }
}

/**
 * @param {string} campaignId
 */
export async function deleteSellerPersonalCategoryCampaignByStaff(campaignId) {
  try {
    const { data } = await apiClient.delete(
      `/seller-personal-category/moderation/${campaignId}/staff`,
    );
    const parsed = parseApiContractData(
      data,
      staffSellerPersonalCategoryCampaignActionDataSchema,
    );
    return parsed.message;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(
        e,
        SELLER_PERSONAL_CATEGORY_MODERATION_PAGE_UI.STAFF_DELETE_FALLBACK,
      ),
    );
  }
}
