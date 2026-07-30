import { useEffect } from "react";

import { lockBodyScroll, lockBodyScrollOverflowOnly } from "./scrollLock.js";

/**
 * @param {boolean} active
 * @param {{ strategy?: "fixed" | "overflow" }} [options]
 *   - `fixed` (default): classic body position:fixed lock
 *   - `overflow`: overflow:hidden only — safe for sheets with text inputs / mobile keyboard
 */
export function useScrollLock(active, options = {}) {
  const strategy = options.strategy ?? "fixed";

  useEffect(() => {
    if (!active) return undefined;
    return strategy === "overflow" ? lockBodyScrollOverflowOnly() : lockBodyScroll();
  }, [active, strategy]);
}
