import { useQuery } from "@tanstack/react-query";

import { fetchMySellerPersonalCategoryCampaign } from "../api/sellerPersonalCategoryApi.js";
import { sellerPersonalCategoryQueryKeys } from "./sellerPersonalCategoryQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMySellerPersonalCategoryCampaignQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: sellerPersonalCategoryQueryKeys.myCampaign(),
    queryFn: fetchMySellerPersonalCategoryCampaign,
    enabled,
  });
}
