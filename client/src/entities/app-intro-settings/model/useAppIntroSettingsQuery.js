import { useQuery } from "@tanstack/react-query";

import { fetchAppIntroSettings } from "../api/fetchAppIntroSettings.js";
import { appIntroSettingsQueryKeys } from "./appIntroSettingsQueryKeys.js";

/**
 * @param {{ enabled?: boolean }} [options]
 */
export function useAppIntroSettingsQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: appIntroSettingsQueryKeys.public(),
    queryFn: fetchAppIntroSettings,
    enabled,
    staleTime: 60_000,
  });
}
