import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchSiteHeaderBannerSettings } from "@/entities/site-header-banner/api/siteHeaderBannerApi";
import { siteHeaderBannerQueryKeys } from "@/entities/site-header-banner/model/siteHeaderBannerQueryKeys";

export const usePatchSiteHeaderBannerSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchSiteHeaderBannerSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: siteHeaderBannerQueryKeys.all });
    },
  });
};
