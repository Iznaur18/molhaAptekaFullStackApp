import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchAppIntroSettings } from "@/entities/app-intro-settings/api/fetchAppIntroSettings";
import { appIntroSettingsQueryKeys } from "@/entities/app-intro-settings/model/types";
import type { AppIntroSettings } from "@/entities/app-intro-settings/model/types";
import { hasSeenAppIntro, markAppIntroSeen } from "@/features/app-intro/lib/introStorage";
import { prefersReducedMotion } from "@/features/app-intro/lib/prefersReducedMotion";

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

export const AppIntroProvider = ({ children }: AppIntroProviderProps) => {
  const queryClient = useQueryClient();
  const [isReplay, setIsReplay] = useState(false);
  const [previewSettings, setPreviewSettings] = useState<AppIntroSettings | null>(null);
  const [isFirstVisitVisible, setIsFirstVisitVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        if (await prefersReducedMotion()) {
          await markAppIntroSeen();
          return;
        }

        await queryClient.fetchQuery({
          queryKey: appIntroSettingsQueryKeys.public(),
          queryFn: fetchAppIntroSettings,
          staleTime: 60_000,
        });

        if (cancelled || (await hasSeenAppIntro())) {
          return;
        }

        setIsFirstVisitVisible(true);
      } catch {
        if (!cancelled && !(await hasSeenAppIntro())) {
          setIsFirstVisitVisible(true);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  const dismissIntro = useCallback(() => {
    void markAppIntroSeen();
    setIsFirstVisitVisible(false);
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
      isIntroVisible: isFirstVisitVisible || isReplay,
      previewSettings,
      dismissIntro,
      replayIntro,
      previewIntro,
    }),
    [dismissIntro, isFirstVisitVisible, isReplay, previewIntro, previewSettings, replayIntro],
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
