import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchAppIntroSettings } from "../api/patchAppIntroSettings.js";
import { appIntroSettingsQueryKeys } from "./appIntroSettingsQueryKeys.js";

export function usePatchAppIntroSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchAppIntroSettings,
    onSuccess: (payload) => {
      queryClient.setQueryData(appIntroSettingsQueryKeys.public(), payload);
    },
  });
}
