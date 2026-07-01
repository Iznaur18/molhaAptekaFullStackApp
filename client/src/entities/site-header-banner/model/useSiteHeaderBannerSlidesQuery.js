import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSlides } from "../api/fetchSiteHeaderBannerSlides.js";
import { siteHeaderBannerQueryKeys } from "./siteHeaderBannerQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useSiteHeaderBannerSlidesQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: siteHeaderBannerQueryKeys.slides(),
    queryFn: fetchSiteHeaderBannerSlides,
    enabled,
    select: (data) => data.slides ?? [],
    staleTime: 60_000,
  });
}
