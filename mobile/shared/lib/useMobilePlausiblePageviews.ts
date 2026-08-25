import { useEffect, useRef } from "react";
import { usePathname } from "expo-router";

import { isMobilePlausibleEnabled } from "@/shared/lib/plausibleEnv";
import { trackMobilePlausiblePageview } from "@/shared/lib/trackMobilePlausiblePageview";

/** Pageview на смену expo-router pathname. */
export function useMobilePlausiblePageviews(): void {
  const pathname = usePathname();
  const previousPathRef = useRef("");

  useEffect(() => {
    if (!isMobilePlausibleEnabled()) {
      return;
    }
    if (!pathname || pathname === previousPathRef.current) {
      return;
    }
    previousPathRef.current = pathname;
    void trackMobilePlausiblePageview(pathname);
  }, [pathname]);
}
