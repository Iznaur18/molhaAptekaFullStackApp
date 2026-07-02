import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelSiteHeaderBannerCampaign,
  submitSiteHeaderBannerCampaign,
} from "@/entities/site-header-banner-campaign/api/siteHeaderBannerCampaignApi";
import { siteHeaderBannerCampaignQueryKeys } from "@/entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys";
import { loyaltyPointsQueryKeys } from "@/shared/api";

export const useSiteHeaderBannerCampaignMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
  };

  const submitMutation = useMutation({
    mutationFn: submitSiteHeaderBannerCampaign,
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSiteHeaderBannerCampaign,
    onSuccess: invalidate,
  });

  return { submitMutation, cancelMutation };
};
