import {
  cancelSiteHeaderBannerCampaignDataSchema,
  mySiteHeaderBannerCampaignDataSchema,
  submitSiteHeaderBannerCampaignBodySchema,
  submitSiteHeaderBannerCampaignDataSchema,
} from "@molha/api-contract";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<import('zod').infer<typeof mySiteHeaderBannerCampaignDataSchema>>}
 */
export async function fetchMySiteHeaderBannerCampaign() {
  try {
    const { data } = await apiClient.get("/site-header-banner-campaign/me");
    return parseApiContractData(data, mySiteHeaderBannerCampaignDataSchema);
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.FETCH_FALLBACK),
    );
  }
}

/**
 * @param {Record<string, unknown>} body
 */
export async function submitSiteHeaderBannerCampaign(body) {
  try {
    const parsedBody = submitSiteHeaderBannerCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/site-header-banner-campaign", parsedBody);
    const parsed = parseApiContractData(data, submitSiteHeaderBannerCampaignDataSchema);
    return {
      message: parsed.message,
      campaign: parsed.campaign,
      loyaltyPointsBalance: parsed.loyaltyPointsBalance ?? null,
    };
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.SUBMIT_FALLBACK),
    );
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelSiteHeaderBannerCampaign(campaignId) {
  try {
    const { data } = await apiClient.delete(`/site-header-banner-campaign/${campaignId}`);
    const parsed = parseApiContractData(data, cancelSiteHeaderBannerCampaignDataSchema);
    return {
      message: parsed.message,
    };
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, SITE_HEADER_BANNER_CAMPAIGN_PAGE_UI.CANCEL_FALLBACK),
    );
  }
}
