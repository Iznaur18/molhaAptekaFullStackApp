import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { INTRO_AD_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { myIntroAdCampaignDataSchema } from "@molha/api-contract";

/**
 * @returns {Promise<import('../model/types.js').MyIntroAdCampaignResponse>}
 */
export async function fetchMyIntroAdCampaign() {
  try {
    const { data } = await apiClient.get("/intro-ad/me");
    return parseApiContractData(data, myIntroAdCampaignDataSchema);
  } catch (e) {
    const message =
      e?.response?.data?.message ?? e?.message ?? INTRO_AD_PAGE_UI.FETCH_FALLBACK;
    throw new Error(message);
  }
}
