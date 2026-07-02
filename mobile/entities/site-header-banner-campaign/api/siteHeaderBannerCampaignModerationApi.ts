import {
  siteHeaderBannerCampaignModerationCountDataSchema,
  siteHeaderBannerCampaignModerationListDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchPendingSiteHeaderBannerCampaigns = async (limit = 50) => {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/pending", {
      params: { limit },
    });
    const parsed = parseApiContractData(data, siteHeaderBannerCampaignModerationListDataSchema);
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.FETCH_FALLBACK),
    );
  }
};

export const fetchPendingSiteHeaderBannerCampaignsCount = async () => {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/pending/count");
    const parsed = parseApiContractData(
      data,
      siteHeaderBannerCampaignModerationCountDataSchema,
    );
    return parsed.count;
  } catch {
    return 0;
  }
};

export const fetchManagedSiteHeaderBannerCampaigns = async () => {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/moderation/managed");
    const parsed = parseApiContractData(data, siteHeaderBannerCampaignModerationListDataSchema);
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK,
      ),
    );
  }
};

export const approveSiteHeaderBannerCampaign = async (campaignId: string) => {
  try {
    const { data } = await apiClient.post(
      `/site-header-banner-campaign/moderation/${campaignId}/approve`,
    );
    return String(
      data?.data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_SUCCESS,
    );
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.APPROVE_FALLBACK),
    );
  }
};

export const rejectSiteHeaderBannerCampaign = async (campaignId: string, reason = "") => {
  try {
    const { data } = await apiClient.post(
      `/site-header-banner-campaign/moderation/${campaignId}/reject`,
      { reason: reason.trim() || null },
    );
    return String(
      data?.data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_SUCCESS,
    );
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.REJECT_FALLBACK),
    );
  }
};

export const cancelSiteHeaderBannerCampaignByStaff = async (campaignId: string) => {
  try {
    const { data } = await apiClient.delete(
      `/site-header-banner-campaign/moderation/${campaignId}`,
    );
    return String(
      data?.data?.message ?? SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_SUCCESS,
    );
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(
        error,
        SITE_HEADER_BANNER_CAMPAIGN_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK,
      ),
    );
  }
};
