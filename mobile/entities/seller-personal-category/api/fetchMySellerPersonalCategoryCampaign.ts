import { apiClient, parseMySellerPersonalCategoryCampaignData } from "@/shared/api";
import { SELLER_PERSONAL_CATEGORY_PAGE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMySellerPersonalCategoryCampaign = async () => {
  try {
    const { data } = await apiClient.get("/seller-personal-category/me");
    return parseMySellerPersonalCategoryCampaignData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, SELLER_PERSONAL_CATEGORY_PAGE_UI.FETCH_FALLBACK),
    );
  }
};
