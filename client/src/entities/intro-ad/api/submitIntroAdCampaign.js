import {
  cancelIntroAdCampaignDataSchema,
  submitIntroAdCampaignBodySchema,
  submitIntroAdCampaignDataSchema,
} from "@molha/api-contract";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { INTRO_AD_PAGE_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {Record<string, unknown>} body
 */
export async function submitIntroAdCampaign(body) {
  try {
    const parsedBody = submitIntroAdCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/intro-ad", parsedBody);
    const parsed = parseApiContractData(data, submitIntroAdCampaignDataSchema);
    return {
      message: parsed.message,
      campaign: parsed.campaign,
      loyaltyPointsBalance: parsed.loyaltyPointsBalance ?? null,
    };
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, INTRO_AD_PAGE_UI.SUBMIT_FALLBACK));
  }
}

/**
 * @param {string} campaignId
 */
export async function cancelIntroAdCampaign(campaignId) {
  try {
    const { data } = await apiClient.delete(`/intro-ad/${campaignId}`);
    const parsed = parseApiContractData(data, cancelIntroAdCampaignDataSchema);
    return {
      message: parsed.message,
    };
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, INTRO_AD_PAGE_UI.CANCEL_FALLBACK));
  }
}

/**
 * @typedef {import('zod').infer<typeof import('@molha/api-contract').submitIntroAdCampaignBodySchema>} SubmitIntroAdCampaignBody
 */
