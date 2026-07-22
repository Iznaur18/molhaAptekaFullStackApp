import { useCallback, useEffect, useRef } from "react";

import "./ProductMediaHorizontalPager.css";

const SCROLL_INDEX_SETTLE_MS = 80;

/**
 * Горизонтальный pager со scroll-snap — паритет с mobile FlatList pagingEnabled.
 *
 * @param {{
 *   slideCount: number;
 *   activeIndex: number;
 *   onIndexChange: (index: number) => void;
 *   renderSlide: (index: number) => import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function ProductMediaHorizontalPager({
  slideCount,
  activeIndex,
  onIndexChange,
  renderSlide,
  className = "",
}) {
  const scrollerRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const skipScrollSyncRef = useRef(false);
  const settleTimerRef = useRef(/** @type {ReturnType<typeof setTimeout> | null} */ (null));
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const scrollToActiveIndex = useCallback(
    (behavior) => {
      const scroller = scrollerRef.current;
      if (!scroller || slideCount <= 1) {
        return;
      }
      const width = scroller.clientWidth;
      if (width <= 0) {
        return;
      }
      const targetLeft = activeIndex * width;
      if (Math.abs(scroller.scrollLeft - targetLeft) < 1) {
        return;
      }
      scroller.scrollTo({ left: targetLeft, behavior });
    },
    [activeIndex, slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1) {
      return undefined;
    }
    if (skipScrollSyncRef.current) {
      skipScrollSyncRef.current = false;
      return undefined;
    }
    scrollToActiveIndex("smooth");
    return undefined;
  }, [activeIndex, scrollToActiveIndex, slideCount]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(() => {
      scrollToActiveIndex("auto");
    });
    observer.observe(scroller);
    return () => {
      observer.disconnect();
    };
  }, [scrollToActiveIndex]);

  const syncIndexFromScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slideCount <= 1) {
      return;
    }
    const width = scroller.clientWidth;
    if (width <= 0) {
      return;
    }
    const nextIndex = Math.min(
      Math.max(Math.round(scroller.scrollLeft / width), 0),
      slideCount - 1,
    );
    if (nextIndex === activeIndexRef.current) {
      return;
    }
    skipScrollSyncRef.current = true;
    onIndexChange(nextIndex);
  }, [onIndexChange, slideCount]);

  const scheduleSyncFromScroll = useCallback(() => {
    if (settleTimerRef.current != null) {
      clearTimeout(settleTimerRef.current);
    }
    settleTimerRef.current = setTimeout(() => {
      settleTimerRef.current = null;
      syncIndexFromScroll();
    }, SCROLL_INDEX_SETTLE_MS);
  }, [syncIndexFromScroll]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slideCount <= 1) {
      return undefined;
    }

    const onScrollEnd = () => {
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      syncIndexFromScroll();
    };

    scroller.addEventListener("scrollend", onScrollEnd);
    return () => {
      scroller.removeEventListener("scrollend", onScrollEnd);
      if (settleTimerRef.current != null) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, [slideCount, syncIndexFromScroll]);

  if (slideCount <= 1) {
    return (
      <div className={["product-media-horizontal-pager", className].filter(Boolean).join(" ")}>
        <div className="product-media-horizontal-pager__slide">{renderSlide(0)}</div>
      </div>
    );
  }

  const rootClassName = [
    "product-media-horizontal-pager",
    "product-media-horizontal-pager--multi",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={scrollerRef} className={rootClassName} onScroll={scheduleSyncFromScroll}>
      {Array.from({ length: slideCount }, (_, index) => (
        <div key={index} className="product-media-horizontal-pager__slide">
          {renderSlide(index)}
        </div>
      ))}
    </div>
  );
}
