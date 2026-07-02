import {
  siteHeaderBannerCampaignModerationCountDataSchema,
  siteHeaderBannerCampaignModerationListDataSchema,
} from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {{ limit?: number }} [params]
 */
export async function fetchPendingSiteHeaderBannerCampaigns(params = {}) {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/pending", {
      params: { limit: params.limit ?? 50 },
    });
    return parseApiContractData(data, siteHeaderBannerCampaignModerationListDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.FETCH_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingSiteHeaderBannerCampaignsCount() {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/pending/count");
    const parsed = parseApiContractData(
      data,
      siteHeaderBannerCampaignModerationCountDataSchema,
    );
    return parsed.count;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.FETCH_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @returns {Promise<import('zod').infer<typeof siteHeaderBannerCampaignModerationListDataSchema>>}
 */
export async function fetchManagedSiteHeaderBannerCampaigns() {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/managed");
    return parseApiContractData(data, siteHeaderBannerCampaignModerationListDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 */
export async function approveSiteHeaderBannerCampaign(campaignId) {
  try {
    const { data } = await apiClient.post(
      `/site-header-banner-campaign/moderation/${campaignId}/approve`,
    );
    return String(data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_SUCCESS);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelSiteHeaderBannerCampaignByStaff(campaignId) {
  try {
    const { data } = await apiClient.delete(
      `/site-header-banner-campaign/moderation/${campaignId}`,
    );
    return String(
      data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_SUCCESS,
    );
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 * @param {string} [reason]
 */
export async function rejectSiteHeaderBannerCampaign(campaignId, reason = "") {
  try {
    const { data } = await apiClient.post(
      `/site-header-banner-campaign/moderation/${campaignId}/reject`,
      {
        reason: reason.trim() || null,
      },
    );
    return String(data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_SUCCESS);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_FALLBACK;
    throw new Error(message);
  }
}
