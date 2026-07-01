import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchSiteHeaderBannerSettings } from "../api/patchSiteHeaderBannerSettings.js";
import { siteHeaderBannerQueryKeys } from "./siteHeaderBannerQueryKeys.js";

export function usePatchSiteHeaderBannerSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchSiteHeaderBannerSettings,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: siteHeaderBannerQueryKeys.all });
    },
  });
}
