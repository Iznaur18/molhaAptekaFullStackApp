import { useQuery } from "@tanstack/react-query";

import { fetchGuestProfileLoginMenuBannerImageUrl } from "@/entities/site-header-banner/api/siteHeaderBannerApi";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";

export const useGuestProfileLoginMenuBannerImageQuery = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: siteHeaderBannerQueryKeys.guestProfileLoginMenuBannerImageUrl(),
    queryFn: fetchGuestProfileLoginMenuBannerImageUrl,
    enabled,
    staleTime: 60_000,
  });

