import { createContext, useCallback, useContext, useMemo, useState } from "react";

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
 * Web: авто-интро при заходе отключено.
 * Preview/replay остаются для admin / advertising / moderation.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppIntroProvider({ children }) {
  const [isReplay, setIsReplay] = useState(false);
  const [previewSettings, setPreviewSettings] = useState(
    /** @type {AppIntroSettings | null} */ (null),
  );

  const dismissIntro = useCallback(() => {
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
      isIntroVisible: isReplay,
      previewSettings,
      dismissIntro,
      replayIntro,
      previewIntro,
    }),
    [dismissIntro, isReplay, previewIntro, previewSettings, replayIntro],
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
