import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { isPlausibleEnabled } from "../lib/plausibleEnv.js";
import { trackPlausiblePageview } from "../lib/trackPlausiblePageview.js";

/** Трекает pageview на каждый SPA navigation. */
export function PlausiblePageviews() {
  const location = useLocation();
  const previousPathRef = useRef("");

  useEffect(() => {
    if (!isPlausibleEnabled()) {
      return;
    }

    const path = `${location.pathname}${location.search}`;
    if (path === previousPathRef.current) {
      return;
    }
    previousPathRef.current = path;
    trackPlausiblePageview();
  }, [location.pathname, location.search]);

  return null;
}
