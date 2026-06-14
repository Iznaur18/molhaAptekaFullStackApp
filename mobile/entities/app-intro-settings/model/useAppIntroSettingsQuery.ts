import { useQuery } from "@tanstack/react-query";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import { appIntroSettingsQueryKeys } from "@/shared/api";

export const useAppIntroSettingsQuery = (enabled = true) =>
  useQuery({
    queryKey: appIntroSettingsQueryKeys.all,
    queryFn: fetchAppIntroSettings,
    enabled,
  });
