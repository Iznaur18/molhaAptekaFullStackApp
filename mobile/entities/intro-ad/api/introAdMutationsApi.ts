import { submitIntroAdCampaignBodySchema } from "@molha/api-contract";

import { apiClient } from "@/shared/api";
import { INTRO_AD_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const submitIntroAdCampaign = async (body: Record<string, unknown>) => {
  try {
    const parsedBody = submitIntroAdCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/intro-ad", parsedBody);
    if (!data?.success) {
      throw new Error(INTRO_AD_PAGE_UI.SUBMIT_FALLBACK);
    }
    return data.data as {
      message?: string;
      loyaltyPointsBalance?: number | null;
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, INTRO_AD_PAGE_UI.SUBMIT_FALLBACK));
  }
};

export const cancelIntroAdCampaign = async (campaignId: string) => {
  try {
    const { data } = await apiClient.delete(`/intro-ad/${campaignId}`);
    if (!data?.success) {
      throw new Error(INTRO_AD_PAGE_UI.CANCEL_FALLBACK);
    }
    return data.data as { message?: string };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, INTRO_AD_PAGE_UI.CANCEL_FALLBACK));
  }
};
