import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSlides } from "@/entities/site-header-banner/api/siteHeaderBannerApi";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";

export const useSiteHeaderBannerSlidesQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: siteHeaderBannerQueryKeys.slides(),
    queryFn: fetchSiteHeaderBannerSlides,
    enabled,
    staleTime: 60_000,
  });
