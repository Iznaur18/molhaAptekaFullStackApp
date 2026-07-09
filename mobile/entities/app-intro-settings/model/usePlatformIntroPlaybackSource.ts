import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import { resolveAppIntroPlaybackConfig } from "@/entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig";

import { appIntroSettingsQueryKeys } from "./types";

export const usePlatformIntroPlaybackSource = () => {
  const settingsQuery = useQuery({
    queryKey: appIntroSettingsQueryKeys.public(),
    queryFn: fetchAppIntroSettings,
    staleTime: 60_000,
  });

  const playback = useMemo(
    () => resolveAppIntroPlaybackConfig(settingsQuery.data?.settings ?? null),
    [settingsQuery.data?.settings],
  );

  return {
    playback,
    isPending: settingsQuery.isPending,
  };
};
