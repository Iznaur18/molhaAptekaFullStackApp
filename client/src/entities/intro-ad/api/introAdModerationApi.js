import {
  managedIntroAdCampaignsDataSchema,
  pendingIntroAdCampaignsCountDataSchema,
  pendingIntroAdCampaignsDataSchema,
} from "@molha/api-contract";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { INTRO_AD_MODERATION_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { fetchPendingRafflesCount } from "../../raffle/api/fetchPendingRafflesCount.js";
import { fetchPendingSiteHeaderBannerCampaignsCount } from "../../site-header-banner-campaign/api/siteHeaderBannerCampaignModerationApi.js";
import { fetchPendingSellerPersonalCategoryCampaignsCount } from "../../seller-personal-category/api/sellerPersonalCategoryApi.js";

/**
 * @param {{ limit?: number }} [params]
 */
export async function fetchPendingIntroAdCampaigns(params = {}) {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/pending", {
      params: { limit: params.limit ?? 50 },
    });
    return parseApiContractData(data, pendingIntroAdCampaignsDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingIntroAdCampaignsOnlyCount() {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/pending/count");
    const parsed = parseApiContractData(data, pendingIntroAdCampaignsCountDataSchema);
    return parsed.count;
  } catch {
    return 0;
  }
}

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingAdModerationNavBadgeCount() {
  const [introCount, bannerCount, personalCategoryCount, raffleCount] = await Promise.all([
    fetchPendingIntroAdCampaignsOnlyCount(),
    fetchPendingSiteHeaderBannerCampaignsCount().catch(() => 0),
    fetchPendingSellerPersonalCategoryCampaignsCount().catch(() => 0),
    fetchPendingRafflesCount().catch(() => 0),
  ]);
  return introCount + bannerCount + personalCategoryCount + raffleCount;
}

/**
 * @returns {Promise<number>}
 */
export async function fetchPendingIntroAdCampaignsCount() {
  return fetchPendingAdModerationNavBadgeCount();
}

/**
 * @returns {Promise<import('zod').infer<typeof managedIntroAdCampaignsDataSchema>>}
 */
export async function fetchManagedIntroAdCampaigns() {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/managed");
    return parseApiContractData(data, managedIntroAdCampaignsDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      INTRO_AD_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 */
export async function approveIntroAdCampaign(campaignId) {
  try {
    const { data } = await apiClient.post(`/intro-ad/moderation/${campaignId}/approve`);
    return String(data?.message ?? INTRO_AD_MODERATION_PAGE_UI.APPROVE_SUCCESS);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      INTRO_AD_MODERATION_PAGE_UI.APPROVE_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelIntroAdCampaignByStaff(campaignId) {
  try {
    const { data } = await apiClient.delete(`/intro-ad/moderation/${campaignId}`);
    return String(data?.message ?? INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL_SUCCESS);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK;
    throw new Error(message);
  }
}

/**
 * @param {string} campaignId
 */
export async function rejectIntroAdCampaign(campaignId, reason = "") {
  try {
    const { data } = await apiClient.post(`/intro-ad/moderation/${campaignId}/reject`, {
      reason: reason.trim() || null,
    });
    return String(data?.message ?? INTRO_AD_MODERATION_PAGE_UI.REJECT_SUCCESS);
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      INTRO_AD_MODERATION_PAGE_UI.REJECT_FALLBACK;
    throw new Error(message);
  }
}
