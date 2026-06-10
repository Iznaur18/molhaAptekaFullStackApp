import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { fetchAppIntroSettings } from "../../../entities/app-intro-settings/api/fetchAppIntroSettings.js";
import { appIntroSettingsQueryKeys } from "../../../entities/app-intro-settings/model/appIntroSettingsQueryKeys.js";
import { markAppIntroSeen, hasSeenAppIntro } from "../lib/introStorage.js";
import { prefersReducedMotion } from "../lib/prefersReducedMotion.js";

/** @typedef {import('../../../entities/app-intro-settings/model/types.js').AppIntroSettings} AppIntroSettings */

/** @type {import('react').Context<{
 *   isIntroVisible: boolean;
 *   previewSettings: AppIntroSettings | null;
 *   dismissIntro: () => void;
 *   replayIntro: () => void;
 *   previewIntro: (settings: AppIntroSettings) => void;
 * } | null>} */
const AppIntroContext = createContext(null);

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppIntroProvider({ children }) {
  const queryClient = useQueryClient();
  const [isReplay, setIsReplay] = useState(false);
  const [previewSettings, setPreviewSettings] = useState(
    /** @type {AppIntroSettings | null} */ (null),
  );
  const [isFirstVisitVisible, setIsFirstVisitVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      markAppIntroSeen();
      return undefined;
    }

    let cancelled = false;

    void queryClient
      .fetchQuery({
        queryKey: appIntroSettingsQueryKeys.public(),
        queryFn: fetchAppIntroSettings,
        staleTime: 60_000,
      })
      .finally(() => {
        if (cancelled || hasSeenAppIntro()) {
          return;
        }
        setIsFirstVisitVisible(true);
      });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  const isIntroVisible = isFirstVisitVisible || isReplay;

  const dismissIntro = useCallback(() => {
    markAppIntroSeen();
    setIsFirstVisitVisible(false);
    setIsReplay(false);
    setPreviewSettings(null);
  }, []);

  const replayIntro = useCallback(() => {
    setPreviewSettings(null);
    setIsReplay(true);
  }, []);

  const previewIntro = useCallback((settings) => {
    setPreviewSettings(settings);
    setIsReplay(true);
  }, []);

  const value = useMemo(
    () => ({
      isIntroVisible,
      previewSettings,
      dismissIntro,
      replayIntro,
      previewIntro,
    }),
    [dismissIntro, isIntroVisible, previewIntro, previewSettings, replayIntro],
  );

  return <AppIntroContext.Provider value={value}>{children}</AppIntroContext.Provider>;
}

export function useAppIntro() {
  const ctx = useContext(AppIntroContext);
  if (!ctx) {
    throw new Error("useAppIntro must be used within AppIntroProvider");
  }
  return ctx;
}
