import { useCallback, useEffect, useRef } from "react";

const DRAG_THRESHOLD_PX = 4;
const AUTO_SCROLL_PX_PER_SEC = 32;
const AUTO_SCROLL_RESUME_MS = 800;

/**
 * Горизонтальная лента бейджей: drag + плавный auto ping-pong при overflow.
 */
export function useHorizontalPointerDragScroll() {
  const ref = useRef(null);
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

  useEffect(() => {
    const auto = autoScrollRef.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        pauseAutoScroll();
      }
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);

    const tick = (timestamp) => {
      const el = ref.current;
      if (!el) {
        auto.rafId = window.requestAnimationFrame(tick);
        return;
      }

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 2) {
        el.scrollLeft = 0;
        auto.direction = 1;
        auto.lastTs = timestamp;
        auto.rafId = window.requestAnimationFrame(tick);
        return;
      }

      const isDragging = Boolean(dragStateRef.current?.isActive);
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
    };
  }, [pauseAutoScroll]);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return undefined;
    }

    const clampScroll = () => {
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (el.scrollLeft > maxScroll) {
        el.scrollLeft = maxScroll;
      }
    };

    const observer = new ResizeObserver(clampScroll);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const finishDrag = useCallback(
    (event) => {
      const el = ref.current;
      const state = dragStateRef.current;
      if (!el || !state?.isActive) {
        return;
      }

      if (state.pointerId === event.pointerId) {
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

      scheduleAutoScrollResume();
    },
    [scheduleAutoScrollResume],
  );

  const onPointerDown = useCallback(
    (event) => {
      const el = ref.current;
      if (!el || event.button !== 0) {
        return;
      }

      pauseAutoScroll();

      dragStateRef.current = {
        isActive: true,
        didDrag: false,
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: el.scrollLeft,
      };

      el.setPointerCapture(event.pointerId);
    },
    [pauseAutoScroll],
  );

  const onPointerMove = useCallback((event) => {
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
      el.classList.add("is-drag-scrolling");
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
      onPointerEnter: pauseAutoScroll,
      onPointerLeave: scheduleAutoScrollResume,
    },
  };
}
