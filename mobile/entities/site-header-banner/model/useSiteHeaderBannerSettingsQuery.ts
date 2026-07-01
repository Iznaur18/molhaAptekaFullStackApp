import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSettings } from "@/entities/site-header-banner/api/siteHeaderBannerApi";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";

export const useSiteHeaderBannerSettingsQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: siteHeaderBannerQueryKeys.settings(),
    queryFn: fetchSiteHeaderBannerSettings,
    enabled,
    staleTime: 0,
  });
