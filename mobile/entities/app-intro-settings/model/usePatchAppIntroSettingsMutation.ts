import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchAppIntroSettings } from "@/entities/app-intro-settings/api/patchAppIntroSettings";
import { appIntroSettingsQueryKeys } from "@/shared/api";

export const usePatchAppIntroSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => patchAppIntroSettings(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appIntroSettingsQueryKeys.all });
    },
  });
};
