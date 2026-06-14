import { useQuery } from "@tanstack/react-query";

import { introAdQueryKeys } from "@/shared/api";

import { fetchMyIntroAdCampaign } from "../api/fetchMyIntroAdCampaign";

export const useMyIntroAdCampaignQuery = (enabled = true) => {
  return useQuery({
    queryKey: introAdQueryKeys.myCampaign(),
    queryFn: fetchMyIntroAdCampaign,
    enabled,
  });
};
