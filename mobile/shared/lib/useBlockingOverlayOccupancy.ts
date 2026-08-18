import { useEffect, useState } from "react";

import {
  acquireBlockingOverlay,
  getBlockingOverlayCount,
  subscribeBlockingOverlayCount,
} from "./blockingOverlayOccupancy";

export const useBlockingOverlayCount = () => {
  const [count, setCount] = useState(getBlockingOverlayCount);
  useEffect(() => subscribeBlockingOverlayCount(setCount), []);
  return count;
};

export const useRegisterBlockingOverlay = (active: boolean) => {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    return acquireBlockingOverlay();
  }, [active]);
};
