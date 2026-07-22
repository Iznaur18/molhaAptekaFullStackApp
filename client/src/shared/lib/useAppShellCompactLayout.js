import { useEffect, useState } from "react";

import { APP_SHELL_MOBILE_NAV_BREAKPOINT_PX } from "./appShellMobileNavConstants.js";

/**
 * Компактный layout (bottom nav + mobile header): реальная ширина окна ≤ 640px.
 * Не использовать content-cap — иначе планшет 600–767 ошибочно станет «mobile».
 *
 * @returns {boolean}
 */
export function useAppShellCompactLayout() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.innerWidth <= APP_SHELL_MOBILE_NAV_BREAKPOINT_PX;
  });

  useEffect(() => {
    const syncLayout = () => {
      setIsCompact(window.innerWidth <= APP_SHELL_MOBILE_NAV_BREAKPOINT_PX);
    };

    window.addEventListener("resize", syncLayout);
    syncLayout();

    return () => {
      window.removeEventListener("resize", syncLayout);
    };
  }, []);

  return isCompact;
}
