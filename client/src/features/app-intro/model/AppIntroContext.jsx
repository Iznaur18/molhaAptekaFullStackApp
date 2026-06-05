import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { markAppIntroSeen, hasSeenAppIntro } from "../lib/introStorage.js";
import { prefersReducedMotion } from "../lib/prefersReducedMotion.js";

/** @type {import('react').Context<{
 *   isIntroVisible: boolean;
 *   dismissIntro: () => void;
 *   replayIntro: () => void;
 * } | null>} */
const AppIntroContext = createContext(null);

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function AppIntroProvider({ children }) {
  const [isReplay, setIsReplay] = useState(false);
  const [isFirstVisitVisible, setIsFirstVisitVisible] = useState(() => {
    if (prefersReducedMotion()) {
      markAppIntroSeen();
      return false;
    }
    return !hasSeenAppIntro();
  });

  const isIntroVisible = isFirstVisitVisible || isReplay;

  const dismissIntro = useCallback(() => {
    markAppIntroSeen();
    setIsFirstVisitVisible(false);
    setIsReplay(false);
  }, []);

  const replayIntro = useCallback(() => {
    setIsReplay(true);
  }, []);

  const value = useMemo(
    () => ({
      isIntroVisible,
      dismissIntro,
      replayIntro,
    }),
    [dismissIntro, isIntroVisible, replayIntro],
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
