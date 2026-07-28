import { submitSellerPersonalCategoryCampaignBodySchema } from "@molha/api-contract";

import { apiClient } from "@/shared/api";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const submitSellerPersonalCategoryCampaign = async (body: {
  labelRu: string;
  imageUrl: string;
  tariffCode: string;
  regionCode: string;
}) => {
  try {
    const parsedBody = submitSellerPersonalCategoryCampaignBodySchema.parse(body);
    const { data } = await apiClient.post("/seller-personal-category", parsedBody);
    if (!data?.success) {
      throw new Error(SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_FALLBACK);
    }
    return data.data as {
      message?: string;
      loyaltyPointsBalance?: number | null;
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SELLER_PERSONAL_CATEGORY_PAGE_UI.SUBMIT_FALLBACK),
    );
  }
};

export const cancelSellerPersonalCategoryCampaign = async (campaignId: string) => {
  try {
    const { data } = await apiClient.delete(`/seller-personal-category/${campaignId}`);
    if (!data?.success) {
      throw new Error(SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_FALLBACK);
    }
    return data.data as { message?: string };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SELLER_PERSONAL_CATEGORY_PAGE_UI.CANCEL_FALLBACK),
    );
  }
};
