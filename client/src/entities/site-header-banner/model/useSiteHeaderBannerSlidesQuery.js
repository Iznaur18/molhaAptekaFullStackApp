import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSlides } from "../api/fetchSiteHeaderBannerSlides.js";
import { siteHeaderBannerQueryKeys } from "./siteHeaderBannerQueryKeys.js";

/**
 * @param {{ enabled?: boolean; regionCode?: string }} [options]
 */
export function useSiteHeaderBannerSlidesQuery({ enabled = true, regionCode = "" } = {}) {
  return useQuery({
    queryKey: siteHeaderBannerQueryKeys.slides(regionCode),
    queryFn: () => fetchSiteHeaderBannerSlides({ regionCode: regionCode || undefined }),
    enabled,
    select: (data) => data.slides ?? [],
    staleTime: 60_000,
  });
}
