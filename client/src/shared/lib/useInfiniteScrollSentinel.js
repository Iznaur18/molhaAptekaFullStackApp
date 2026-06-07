import { useEffect } from "react";

const INFINITE_SCROLL_SENTINEL_ROOT_MARGIN = "200px 0px";

/**
 * @param {{
 *   enabled: boolean;
 *   sentinelRef: import('react').RefObject<HTMLDivElement | null>;
 *   onIntersect: () => void | Promise<void>;
 *   observeRevision?: number;
 * }} params
 */
export function useInfiniteScrollSentinel({
  enabled,
  sentinelRef,
  onIntersect,
  observeRevision = 0,
}) {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const el = sentinelRef.current;
    if (!el) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);
        if (!hit) {
          return;
        }
        void onIntersect();
      },
      { root: null, rootMargin: INFINITE_SCROLL_SENTINEL_ROOT_MARGIN, threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, observeRevision, onIntersect, sentinelRef]);
}
