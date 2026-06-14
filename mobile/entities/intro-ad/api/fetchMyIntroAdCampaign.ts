import { apiClient, parseMyIntroAdCampaignData } from "@/shared/api";
import { INTRO_AD_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMyIntroAdCampaign = async () => {
  try {
    const { data } = await apiClient.get("/intro-ad/me");
    return parseMyIntroAdCampaignData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, INTRO_AD_PAGE_UI.FETCH_FALLBACK));
  }
};
