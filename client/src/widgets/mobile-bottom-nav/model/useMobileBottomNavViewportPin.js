import { useEffect } from "react";

import { resolveMobileBottomNavShiftY } from "../lib/resolveMobileBottomNavShiftY.js";

/**
 * Телефонный Chrome/Safari после скролла (адресная строка) и клавиатуры оставляют
 * `position: fixed` на старом низе layout viewport. Поджимаем бар к visual viewport.
 *
 * @param {import("react").RefObject<HTMLElement | null>} navRef
 */
export function useMobileBottomNavViewportPin(navRef) {
  useEffect(() => {
    const nav = navRef.current;
    const viewport = window.visualViewport;
    if (!nav || !viewport) {
      return undefined;
    }

    let currentShiftY = 0;
    let frame = 0;
    let seenOffset = Number.NaN;
    let seenHeight = Number.NaN;
    let verifyPending = false;

    const sync = () => {
      frame = 0;
      seenOffset = viewport.offsetTop;
      seenHeight = viewport.height;
      const rect = nav.getBoundingClientRect();
      const next = resolveMobileBottomNavShiftY({
        currentShiftY,
        rectBottom: rect.bottom,
        rectHeight: rect.height,
        layoutGapPx: Number.parseFloat(getComputedStyle(nav).bottom),
        visualOffsetTop: viewport.offsetTop,
        visualHeight: viewport.height,
      });
      const changed = next !== currentShiftY;
      if (changed) {
        currentShiftY = next;
        nav.style.transform = next === 0 ? "" : `translateY(${next}px)`;
      }
      if (changed && !verifyPending) {
        verifyPending = true;
        seenOffset = Number.NaN;
        seenHeight = Number.NaN;
        schedule();
        return;
      }
      verifyPending = false;
    };

    const schedule = () => {
      if (viewport.offsetTop === seenOffset && viewport.height === seenHeight) {
        return;
      }
      if (frame !== 0) {
        return;
      }
      frame = requestAnimationFrame(sync);
    };

    schedule();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);

    return () => {
      if (frame !== 0) {
        cancelAnimationFrame(frame);
      }
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      nav.style.removeProperty("transform");
    };
  }, [navRef]);
}
