import { useEffect } from "react";

import { lockBodyScroll } from "./scrollLock.js";

/**
 * @param {boolean} active
 */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    return lockBodyScroll();
  }, [active]);
}
