import { useQuery } from "@tanstack/react-query";

import { fetchMySiteHeaderBannerCampaign } from "../api/siteHeaderBannerCampaignApi.js";
import { siteHeaderBannerCampaignQueryKeys } from "./siteHeaderBannerCampaignQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMySiteHeaderBannerCampaignQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
    queryFn: fetchMySiteHeaderBannerCampaign,
    enabled,
  });
}
