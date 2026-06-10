import { useCallback, useEffect, useRef } from "react";

const DRAG_THRESHOLD_PX = 4;
const AUTO_SCROLL_PX_PER_SEC = 16;
const AUTO_SCROLL_RESUME_MS = 800;
const OVERFLOW_EPSILON_PX = 2;

function supportsFinePointerHover() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Горизонтальная лента бейджей: drag + плавный auto ping-pong при overflow.
 */
export function useHorizontalPointerDragScroll() {
  const ref = useRef(null);
  const isVisibleRef = useRef(true);
  const observerCleanupRef = useRef(/** @type {(() => void) | null} */ (null));
  const dragStateRef = useRef(null);
  const autoScrollRef = useRef({
    direction: 1,
    paused: false,
    lastTs: null,
    rafId: 0,
    resumeTimerId: 0,
  });

  const pauseAutoScroll = useCallback(() => {
    const auto = autoScrollRef.current;
    auto.paused = true;
    auto.lastTs = null;
    window.clearTimeout(auto.resumeTimerId);
  }, []);

  const resumeAutoScroll = useCallback(() => {
    autoScrollRef.current.paused = false;
    autoScrollRef.current.lastTs = null;
  }, []);

  const scheduleAutoScrollResume = useCallback(() => {
    const auto = autoScrollRef.current;
    window.clearTimeout(auto.resumeTimerId);
    auto.resumeTimerId = window.setTimeout(() => {
      resumeAutoScroll();
    }, AUTO_SCROLL_RESUME_MS);
  }, [resumeAutoScroll]);

  const clampScrollLeft = useCallback((el) => {
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (el.scrollLeft > maxScroll) {
      el.scrollLeft = maxScroll;
    }
    if (maxScroll <= OVERFLOW_EPSILON_PX) {
      el.scrollLeft = 0;
      autoScrollRef.current.direction = 1;
    }
  }, []);

  const setRef = useCallback(
    (node) => {
      observerCleanupRef.current?.();
      observerCleanupRef.current = null;
      ref.current = node;

      if (!node) {
        return;
      }

      clampScrollLeft(node);

      const resizeObserver = new ResizeObserver(() => {
        clampScrollLeft(node);
      });
      resizeObserver.observe(node);

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            resumeAutoScroll();
          } else {
            pauseAutoScroll();
          }
        },
        { threshold: 0.01 },
      );
      intersectionObserver.observe(node);

      observerCleanupRef.current = () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
      };
    },
    [clampScrollLeft, pauseAutoScroll, resumeAutoScroll],
  );

  useEffect(() => {
    const auto = autoScrollRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        pauseAutoScroll();
        return;
      }

      if (isVisibleRef.current) {
        resumeAutoScroll();
      }
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const tick = (timestamp) => {
      const el = ref.current;
      if (!el || !isVisibleRef.current) {
        auto.rafId = window.requestAnimationFrame(tick);
        return;
      }

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= OVERFLOW_EPSILON_PX) {
        el.scrollLeft = 0;
        auto.direction = 1;
        auto.lastTs = timestamp;
        auto.rafId = window.requestAnimationFrame(tick);
        return;
      }

      const isDragging = Boolean(dragStateRef.current?.didDrag);
      if (!auto.paused && !isDragging) {
        if (auto.lastTs != null) {
          const deltaSec = Math.min((timestamp - auto.lastTs) / 1000, 0.05);
          let nextScrollLeft =
            el.scrollLeft + AUTO_SCROLL_PX_PER_SEC * deltaSec * auto.direction;

          if (nextScrollLeft >= maxScroll) {
            nextScrollLeft = maxScroll;
            auto.direction = -1;
          } else if (nextScrollLeft <= 0) {
            nextScrollLeft = 0;
            auto.direction = 1;
          }

          el.scrollLeft = nextScrollLeft;
        }
      } else if (auto.paused || isDragging) {
        auto.lastTs = null;
      }

      auto.lastTs = timestamp;
      auto.rafId = window.requestAnimationFrame(tick);
    };

    auto.rafId = window.requestAnimationFrame(tick);

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      window.cancelAnimationFrame(auto.rafId);
      window.clearTimeout(auto.resumeTimerId);
      observerCleanupRef.current?.();
      observerCleanupRef.current = null;
    };
  }, [pauseAutoScroll, resumeAutoScroll]);

  const finishDrag = useCallback(
    (event) => {
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

      if (state.didDrag) {
        scheduleAutoScrollResume();
      }
    },
    [scheduleAutoScrollResume],
  );

  const onPointerDown = useCallback((event) => {
    const el = ref.current;
    if (!el || event.button !== 0) {
      return;
    }

    dragStateRef.current = {
      isActive: true,
      didDrag: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
    };
  }, []);

  const onPointerMove = useCallback(
    (event) => {
      const el = ref.current;
      const state = dragStateRef.current;
      if (!el || !state?.isActive || state.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - state.startX;
      if (!state.didDrag && Math.abs(deltaX) < DRAG_THRESHOLD_PX) {
        return;
      }

      if (!state.didDrag) {
        state.didDrag = true;
        pauseAutoScroll();
        el.classList.add("is-drag-scrolling");
        try {
          el.setPointerCapture(event.pointerId);
        } catch {
          /* capture may fail on some touch targets */
        }
      }

      event.preventDefault();
      el.scrollLeft = state.scrollLeft - deltaX;
    },
    [pauseAutoScroll],
  );

  const onClickCapture = useCallback((event) => {
    if (dragStateRef.current?.didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  const onPointerEnter = useCallback(() => {
    if (supportsFinePointerHover()) {
      pauseAutoScroll();
    }
  }, [pauseAutoScroll]);

  const onPointerLeave = useCallback(() => {
    if (supportsFinePointerHover()) {
      scheduleAutoScrollResume();
    }
  }, [scheduleAutoScrollResume]);

  return {
    ref: setRef,
    dragScrollProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishDrag,
      onPointerCancel: finishDrag,
      onClickCapture,
      onPointerEnter,
      onPointerLeave,
    },
  };
}
