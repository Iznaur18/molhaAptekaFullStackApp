import {
  managedIntroAdCampaignsDataSchema,
  pendingIntroAdCampaignsDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { INTRO_AD_MODERATION_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchPendingIntroAdCampaigns = async (limit = 50) => {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/pending", {
      params: { limit },
    });
    const parsed = parseApiContractData(data, pendingIntroAdCampaignsDataSchema);
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.FETCH_FALLBACK),
    );
  }
};

export const fetchManagedIntroAdCampaigns = async () => {
  try {
    const { data } = await apiClient.get("/intro-ad/moderation/managed");
    const parsed = parseApiContractData(data, managedIntroAdCampaignsDataSchema);
    return parsed.campaigns;
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.MANAGED_FETCH_FALLBACK),
    );
  }
};

export const approveIntroAdCampaign = async (campaignId: string) => {
  try {
    await apiClient.post(`/intro-ad/moderation/${campaignId}/approve`);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.APPROVE_FALLBACK),
    );
  }
};

export const rejectIntroAdCampaign = async (campaignId: string, reason = "") => {
  try {
    await apiClient.post(`/intro-ad/moderation/${campaignId}/reject`, {
      reason: reason.trim() || null,
    });
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.REJECT_FALLBACK),
    );
  }
};

export const cancelIntroAdCampaignByStaff = async (campaignId: string) => {
  try {
    await apiClient.delete(`/intro-ad/moderation/${campaignId}`);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, INTRO_AD_MODERATION_PAGE_UI.STAFF_CANCEL_FALLBACK),
    );
  }
};
