import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import {
  resolveAppIntroPlaybackConfig,
  type AppIntroPlaybackConfig,
} from "@/entities/app-intro-settings/lib/resolveAppIntroPlaybackConfig";

import { appIntroSettingsQueryKeys } from "./types";

/**
 * Плейлист для фона главного экрана: платформенное видео админа (если есть)
 * идёт первым, затем платные ролики рекламодателей. Крутится по кругу.
 */
export const useIntroBackdropPlaylist = () => {
  const settingsQuery = useQuery({
    queryKey: appIntroSettingsQueryKeys.public(),
    queryFn: fetchAppIntroSettings,
    staleTime: 60_000,
  });

  const playlist = useMemo<AppIntroPlaybackConfig[]>(() => {
    const response = settingsQuery.data;
    const items: AppIntroPlaybackConfig[] = [];

    const platform = resolveAppIntroPlaybackConfig(response?.settings ?? null, {
      isPaidIntro: false,
    });
    if (platform.videoMp4Src || platform.posterSrc) {
      items.push(platform);
    }

    for (const intro of response?.paidIntros ?? []) {
      items.push(
        resolveAppIntroPlaybackConfig(intro, {
          isPaidIntro: true,
          advertiserId: intro.advertiserId,
          ctaType: intro.ctaType,
        }),
      );
    }

    return items;
  }, [settingsQuery.data]);

  return {
    playlist,
    isPending: settingsQuery.isPending,
  };
};
