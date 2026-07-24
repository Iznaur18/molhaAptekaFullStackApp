import { useCallback, useRef } from "react";

const DRAG_THRESHOLD_PX = 4;
const IMAGE_DRAG_HANDLE_SELECTOR = ".curated-product-compact-card__image-wrap";

/**
 * Горизонтальный скролл карусели при drag мышью по зоне картинки.
 * Touch/pen — нативный overflow-x + touch-action: pan-x pan-y (иначе ломается вертикальный скролл страницы).
 */
export function useCuratedCarouselImageDragScroll() {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const dragStateRef = useRef(
    /** @type {{ isActive: boolean; didDrag: boolean; pointerId: number; startX: number; startY: number; scrollLeft: number } | null} */ (
      null
    ),
  );

  const isImageDragTarget = useCallback((target) => {
    return target instanceof Element && Boolean(target.closest(IMAGE_DRAG_HANDLE_SELECTOR));
  }, []);

  const finishDrag = useCallback((event) => {
    const el = ref.current;
    const state = dragStateRef.current;
    if (!el || !state?.isActive) {
      return;
    }

    if (state.didDrag && state.pointerId === event.pointerId) {
      try {
        el.releasePointerCapture(event.pointerId);
      } catch {
        /* pointer already released */
      }
    }

    el.classList.remove("is-drag-scrolling");
    dragStateRef.current = {
      didDrag: state.didDrag,
      isActive: false,
    };

    window.setTimeout(() => {
      if (dragStateRef.current && !dragStateRef.current.isActive) {
        dragStateRef.current = null;
      }
    }, 0);
  }, []);

  const onPointerDown = useCallback(
    (event) => {
      const el = ref.current;
      if (
        !el ||
        event.button !== 0 ||
        event.pointerType !== "mouse" ||
        !isImageDragTarget(event.target)
      ) {
        return;
      }

      dragStateRef.current = {
        isActive: true,
        didDrag: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: el.scrollLeft,
      };
    },
    [isImageDragTarget],
  );

  const onPointerMove = useCallback((event) => {
    const el = ref.current;
    const state = dragStateRef.current;
    if (!el || !state?.isActive || state.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;

    if (!state.didDrag) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      if (absX < DRAG_THRESHOLD_PX && absY < DRAG_THRESHOLD_PX) {
        return;
      }
      if (absY > absX) {
        dragStateRef.current = null;
        return;
      }

      state.didDrag = true;
      el.classList.add("is-drag-scrolling");
      try {
        el.setPointerCapture(event.pointerId);
      } catch {
        /* capture may fail on some touch targets */
      }
    }

    event.preventDefault();
    el.scrollLeft = state.scrollLeft - deltaX;
  }, []);

  const onClickCapture = useCallback((event) => {
    if (dragStateRef.current?.didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  return {
    ref,
    dragScrollProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClickCapture,
    },
  };
}
