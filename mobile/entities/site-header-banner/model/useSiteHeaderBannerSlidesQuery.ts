import { useQuery } from "@tanstack/react-query";

import { fetchSiteHeaderBannerSlides } from "@/entities/site-header-banner/api/siteHeaderBannerApi";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";

export const useSiteHeaderBannerSlidesQuery = ({
  enabled = true,
  regionCode = "",
}: { enabled?: boolean; regionCode?: string } = {}) =>
  useQuery({
    queryKey: siteHeaderBannerQueryKeys.slides(regionCode),
    queryFn: () => fetchSiteHeaderBannerSlides({ regionCode: regionCode || undefined }),
    enabled,
    staleTime: 60_000,
  });
