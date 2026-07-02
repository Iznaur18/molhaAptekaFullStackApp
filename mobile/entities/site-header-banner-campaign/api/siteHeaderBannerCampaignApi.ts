import {
  cancelSiteHeaderBannerCampaignDataSchema,
  mySiteHeaderBannerCampaignDataSchema,
  submitSiteHeaderBannerCampaignBodySchema,
  submitSiteHeaderBannerCampaignDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMySiteHeaderBannerCampaign = async () => {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/me");
    return parseApiContractData(data, mySiteHeaderBannerCampaignDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.FETCH_FALLBACK),
    );
  }
};

export const submitSiteHeaderBannerCampaign = async (body: Record<string, unknown>) => {
  try {
    const parsedBody = submitSiteHeaderBannerCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/site-header-banner-campaign", parsedBody);
    return parseApiContractData(data, submitSiteHeaderBannerCampaignDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_FALLBACK),
    );
  }
};

export const cancelSiteHeaderBannerCampaign = async (campaignId: string) => {
  try {
    const { data } = await apiClient.delete(`/site-header-banner-campaign/${campaignId}`);
    return parseApiContractData(data, cancelSiteHeaderBannerCampaignDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_FALLBACK),
    );
  }
};
