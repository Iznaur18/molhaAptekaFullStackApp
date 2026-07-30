import { useEffect, useId } from "react";

import { getFocusableElements } from "./getFocusableElements.js";
import {
  getTopModalFocusLayer,
  popModalFocusLayer,
  pushModalFocusLayer,
} from "./modalFocusStack.js";

/**
 * @param {import('react').RefObject<HTMLElement | null>} containerRef
 * @param {{
 *   active: boolean;
 *   initialFocusRef?: import('react').RefObject<HTMLElement | null>;
 * }} options
 */
export function useDialogFocusTrap(containerRef, { active, initialFocusRef = null }) {
  const layerId = useId();

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    pushModalFocusLayer(layerId, container, previousFocus);

    const focusWithoutScroll = (element) => {
      element.focus({ preventScroll: true });
    };

    const focusInitial = () => {
      const preferred = initialFocusRef?.current;
      if (preferred instanceof HTMLElement) {
        focusWithoutScroll(preferred);
        return;
      }

      const [firstFocusable] = getFocusableElements(container);
      if (firstFocusable) {
        focusWithoutScroll(firstFocusable);
      }
    };

    const focusFrame = requestAnimationFrame(focusInitial);

    const onKeyDown = (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const topLayer = getTopModalFocusLayer();
      if (!topLayer || topLayer.id !== layerId) {
        return;
      }

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        return;
      }

      const first = focusables[0];
      const last = focusables.at(-1);
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        focusWithoutScroll(last);
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        focusWithoutScroll(first);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown, true);

      const removed = popModalFocusLayer(layerId);
      const restoreTarget = removed?.previousFocus;
      if (restoreTarget instanceof HTMLElement && restoreTarget.isConnected) {
        focusWithoutScroll(restoreTarget);
      }
    };
  }, [active, containerRef, initialFocusRef, layerId]);
}
