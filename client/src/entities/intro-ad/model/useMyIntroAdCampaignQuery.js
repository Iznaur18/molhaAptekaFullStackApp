import { useQuery } from "@tanstack/react-query";

import { fetchMyIntroAdCampaign } from "../api/fetchMyIntroAdCampaign.js";
import { introAdQueryKeys } from "./introAdQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useMyIntroAdCampaignQuery(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: introAdQueryKeys.myCampaign(),
    queryFn: fetchMyIntroAdCampaign,
    enabled,
  });
}
