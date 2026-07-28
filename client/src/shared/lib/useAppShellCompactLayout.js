import { useEffect, useState } from "react";

import { APP_SHELL_MOBILE_NAV_BREAKPOINT_PX } from "./appShellMobileNavConstants.js";

/**
 * Компактный layout (mobile topbar): окно ≤ tablet max (до 1024 exclusive).
 * Desktop chrome — с `APP_SHELL_DESKTOP_MIN_PX` (1024+).
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
