import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";

type AppIntroContextValue = {
  isIntroVisible: boolean;
  previewSettings: AppIntroSettings | null;
  dismissIntro: () => void;
  replayIntro: () => void;
  previewIntro: (settings: AppIntroSettings) => void;
};

const AppIntroContext = createContext<AppIntroContextValue | null>(null);

type AppIntroProviderProps = {
  children: ReactNode;
};

/**
 * Автопоказ intro при запуске убран — ролики крутятся фоном главного экрана.
 * Провайдер остаётся только для превью/replay: админ, рекламодатель и
 * модератор открывают полноэкранный предпросмотр ролика по кнопке.
 */
export const AppIntroProvider = ({ children }: AppIntroProviderProps) => {
  const [isReplay, setIsReplay] = useState(false);
  const [previewSettings, setPreviewSettings] = useState<AppIntroSettings | null>(null);

  const dismissIntro = useCallback(() => {
    setIsReplay(false);
    setPreviewSettings(null);
  }, []);

  const replayIntro = useCallback(() => {
    setPreviewSettings(null);
    setIsReplay(true);
  }, []);

  const previewIntro = useCallback((settings: AppIntroSettings) => {
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
};

export const useAppIntro = (): AppIntroContextValue => {
  const context = useContext(AppIntroContext);
  if (!context) {
    throw new Error("useAppIntro must be used within AppIntroProvider");
  }
  return context;
};
