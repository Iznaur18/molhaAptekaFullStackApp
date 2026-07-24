import { useQuery } from "@tanstack/react-query";

import { fetchGuestProfileLoginMenuBannerImageUrl } from "../api/fetchGuestProfileLoginMenuBannerImageUrl.js";
import { siteHeaderBannerQueryKeys } from "./siteHeaderBannerQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useGuestProfileLoginMenuBannerImageQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: siteHeaderBannerQueryKeys.guestProfileLoginMenuBannerImageUrl(),
    queryFn: fetchGuestProfileLoginMenuBannerImageUrl,
    enabled,
    staleTime: 60_000,
  });
}
