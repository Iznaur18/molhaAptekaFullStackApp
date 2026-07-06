import { useEffect, useState } from "react";

import { APP_SHELL_MOBILE_NAV_BREAKPOINT_PX } from "./appShellMobileNavConstants.js";
import { resolveAppViewportWidth } from "./resolveAppViewportWidth.js";

/**
 * Компактный layout (mobile nav, mobile header): ширина веб-приложения
 * ограничена `WEB_APP_SHELL_MAX_WIDTH_PX`, поэтому на десктопе тоже mobile UX.
 *
 * @returns {boolean}
 */
export function useAppShellCompactLayout() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return resolveAppViewportWidth(window.innerWidth) <= APP_SHELL_MOBILE_NAV_BREAKPOINT_PX;
  });

  useEffect(() => {
    const syncLayout = () => {
      setIsCompact(resolveAppViewportWidth(window.innerWidth) <= APP_SHELL_MOBILE_NAV_BREAKPOINT_PX);
    };

    window.addEventListener("resize", syncLayout);
    syncLayout();

    return () => {
      window.removeEventListener("resize", syncLayout);
    };
  }, []);

  return isCompact;
}
