import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSettings } from "../api/fetchSiteHeaderBannerSettings.js";
import { siteHeaderBannerQueryKeys } from "./siteHeaderBannerQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useSiteHeaderBannerSettingsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: siteHeaderBannerQueryKeys.settings(),
    queryFn: fetchSiteHeaderBannerSettings,
    enabled,
    select: (data) => data.settings,
    staleTime: 0,
  });
}
