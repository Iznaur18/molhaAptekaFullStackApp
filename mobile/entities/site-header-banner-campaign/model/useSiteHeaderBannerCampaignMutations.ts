import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  cancelSiteHeaderBannerCampaign,
  submitSiteHeaderBannerCampaign,
} from "@/entities/site-header-banner-campaign/api/siteHeaderBannerCampaignApi";
import { siteHeaderBannerCampaignQueryKeys } from "@/entities/site-header-banner-campaign/model/siteHeaderBannerCampaignQueryKeys";
import { invalidatePromoReturnStreak } from "@/entities/promo-return-streak/model/usePromoReturnStreak";
import { loyaltyPointsQueryKeys } from "@/shared/api";

export const useSiteHeaderBannerCampaignMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAfterSubmit = () => {
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
    void invalidatePromoReturnStreak(queryClient);
  };

  const invalidateAfterCancel = () => {
    void queryClient.invalidateQueries({
      queryKey: siteHeaderBannerCampaignQueryKeys.myCampaign(),
    });
    void queryClient.invalidateQueries({ queryKey: loyaltyPointsQueryKeys.all });
  };

  const submitMutation = useMutation({
    mutationFn: submitSiteHeaderBannerCampaign,
    onSuccess: invalidateAfterSubmit,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSiteHeaderBannerCampaign,
    onSuccess: invalidateAfterCancel,
  });

  return { submitMutation, cancelMutation };
};
