import { useCallback, useEffect, useRef } from "react";

const DRAG_THRESHOLD_PX = 4;
const AUTO_SCROLL_PX_PER_SEC = 16;
const AUTO_SCROLL_RESUME_MS = 800;
const OVERFLOW_EPSILON_PX = 2;

const FINE_POINTER_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function supportsFinePointerHover() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(FINE_POINTER_HOVER_QUERY).matches;
}

/**
 * Горизонтальная лента бейджей: drag + плавный auto ping-pong при overflow.
 *
 * Цикл автопрокрутки живёт, только пока он нужен: ряд виден, бейджи не
 * помещаются, есть мышь (hover + fine pointer), не включено «уменьшение
 * движения» и ряд не на паузе (наведение/перетаскивание). На тач-устройствах
 * автопрокрутки нет — ряд листается пальцем.
 *
 * Раньше requestAnimationFrame перезапускался каждый кадр у каждой
 * смонтированной карточки — даже невидимой и без переполнения: 96 карточек
 * давали ~5800 вызовов в секунду в покое, и iPhone зависал и грелся при
 * прокрутке ленты (13.09.2026).
 */
export function useHorizontalPointerDragScroll() {
  const ref = useRef(null);
  const isVisibleRef = useRef(false);
  const hasOverflowRef = useRef(false);
  const autoScrollAllowedRef = useRef(false);
  const syncAutoScrollLoopRef = useRef(/** @type {(() => void) | null} */ (null));
  const observerCleanupRef = useRef(/** @type {(() => void) | null} */ (null));
  const dragStateRef = useRef(null);
  const autoScrollRef = useRef({
    direction: 1,
    paused: false,
    lastTs: null,
    rafId: 0,
    resumeTimerId: 0,
  });

  const requestAutoScrollLoopSync = useCallback(() => {
    syncAutoScrollLoopRef.current?.();
  }, []);

  const pauseAutoScroll = useCallback(() => {
    const auto = autoScrollRef.current;
    auto.paused = true;
    auto.lastTs = null;
    window.clearTimeout(auto.resumeTimerId);
    requestAutoScrollLoopSync();
  }, [requestAutoScrollLoopSync]);

  const resumeAutoScroll = useCallback(() => {
    autoScrollRef.current.paused = false;
    autoScrollRef.current.lastTs = null;
    requestAutoScrollLoopSync();
  }, [requestAutoScrollLoopSync]);

  const scheduleAutoScrollResume = useCallback(() => {
    const auto = autoScrollRef.current;
    window.clearTimeout(auto.resumeTimerId);
    auto.resumeTimerId = window.setTimeout(() => {
      resumeAutoScroll();
    }, AUTO_SCROLL_RESUME_MS);
  }, [resumeAutoScroll]);

  const measureOverflow = useCallback((el) => {
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (el.scrollLeft > maxScroll) {
      el.scrollLeft = maxScroll;
    }
    const hasOverflow = maxScroll > OVERFLOW_EPSILON_PX;
    if (!hasOverflow) {
      el.scrollLeft = 0;
      autoScrollRef.current.direction = 1;
    }
    hasOverflowRef.current = hasOverflow;
  }, []);

  const setRef = useCallback(
    (node) => {
      observerCleanupRef.current?.();
      observerCleanupRef.current = null;
      ref.current = node;

      if (!node) {
        isVisibleRef.current = false;
        requestAutoScrollLoopSync();
        return;
      }

      measureOverflow(node);

      // Размер самого ряда фиксирован сеткой, переполнение появляется из-за
      // содержимого (шрифты, бейджи) — поэтому смотрим и на детей.
      const resizeObserver = new ResizeObserver(() => {
        measureOverflow(node);
        requestAutoScrollLoopSync();
      });
      resizeObserver.observe(node);
      for (const child of Array.from(node.children)) {
        resizeObserver.observe(child);
      }

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            measureOverflow(node);
          }
          requestAutoScrollLoopSync();
        },
        { threshold: 0.01 },
      );
      intersectionObserver.observe(node);

      observerCleanupRef.current = () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
      };

      requestAutoScrollLoopSync();
    },
    [measureOverflow, requestAutoScrollLoopSync],
  );

  useEffect(() => {
    const auto = autoScrollRef.current;
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const pointerQuery = window.matchMedia(FINE_POINTER_HOVER_QUERY);

    const shouldRunAutoScroll = () =>
      Boolean(ref.current) &&
      autoScrollAllowedRef.current &&
      isVisibleRef.current &&
      hasOverflowRef.current &&
      !auto.paused &&
      !dragStateRef.current?.didDrag;

    const tick = (timestamp) => {
      auto.rafId = 0;
      const el = ref.current;
      if (!el || !shouldRunAutoScroll()) {
        auto.lastTs = null;
        return;
      }

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= OVERFLOW_EPSILON_PX) {
        el.scrollLeft = 0;
        auto.direction = 1;
        auto.lastTs = null;
        hasOverflowRef.current = false;
        return;
      }

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

      auto.lastTs = timestamp;
      auto.rafId = window.requestAnimationFrame(tick);
    };

    const syncAutoScrollLoop = () => {
      if (shouldRunAutoScroll()) {
        if (!auto.rafId) {
          auto.lastTs = null;
          auto.rafId = window.requestAnimationFrame(tick);
        }
        return;
      }

      if (auto.rafId) {
        window.cancelAnimationFrame(auto.rafId);
        auto.rafId = 0;
      }
      auto.lastTs = null;
    };

    const syncEnvironment = () => {
      autoScrollAllowedRef.current = pointerQuery.matches && !motionQuery.matches;
      syncAutoScrollLoop();
    };

    syncAutoScrollLoopRef.current = syncAutoScrollLoop;
    syncEnvironment();
    motionQuery.addEventListener("change", syncEnvironment);
    pointerQuery.addEventListener("change", syncEnvironment);

    return () => {
      motionQuery.removeEventListener("change", syncEnvironment);
      pointerQuery.removeEventListener("change", syncEnvironment);
      syncAutoScrollLoopRef.current = null;
      if (auto.rafId) {
        window.cancelAnimationFrame(auto.rafId);
        auto.rafId = 0;
      }
      window.clearTimeout(auto.resumeTimerId);
      // Наблюдатели снимает setRef(null) при размонтировании: если снимать их
      // здесь, двойной запуск эффектов в StrictMode оставляет ряд без них.
    };
  }, []);

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
