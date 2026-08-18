import { useEffect, useState } from "react";

import {
  acquireBlockingOverlay,
  getBlockingOverlayCount,
  subscribeBlockingOverlayCount,
} from "./blockingOverlayOccupancy.js";

export function useBlockingOverlayCount() {
  const [count, setCount] = useState(getBlockingOverlayCount);
  useEffect(() => subscribeBlockingOverlayCount(setCount), []);
  return count;
}

/** @param {boolean} active */
export function useRegisterBlockingOverlay(active) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    return acquireBlockingOverlay();
  }, [active]);
}
