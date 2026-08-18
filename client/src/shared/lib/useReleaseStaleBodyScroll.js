import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

import { releaseStaleBodyScrollIfIdle } from "./scrollLock.js";

/** На смене URL снимает залипший body lock, если модалки уже нет. */
export function useReleaseStaleBodyScroll() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    releaseStaleBodyScrollIfIdle();
  }, [pathname]);
}
