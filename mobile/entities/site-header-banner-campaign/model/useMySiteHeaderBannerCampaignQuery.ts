import { useQuery } from "@tanstack/react-query";

import { siteHeaderBannerCampaignQueryKeys } from "@/entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys";

import { fetchMySiteHeaderBannerCampaign } from "../api/siteHeaderBannerCampaignApi";

export const useMySiteHeaderBannerCampaignQuery = (enabled = true) =>
  useQuery({
    queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
    queryFn: fetchMySiteHeaderBannerCampaign,
    enabled,
  });
