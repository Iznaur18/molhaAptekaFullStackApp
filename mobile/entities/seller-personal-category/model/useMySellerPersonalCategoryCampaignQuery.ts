import { useQuery } from "@tanstack/react-query";

import { sellerPersonalCategoryQueryKeys } from "@/shared/api";

import { fetchMySellerPersonalCategoryCampaign } from "../api/fetchMySellerPersonalCategoryCampaign";

export const useMySellerPersonalCategoryCampaignQuery = (enabled = true) => {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
    queryFn: fetchMySellerPersonalCategoryCampaign,
    enabled,
  });
};
