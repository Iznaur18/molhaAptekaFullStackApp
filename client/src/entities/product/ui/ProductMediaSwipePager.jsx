import { useCallback, useLayoutEffect, useRef } from "react";

import "./ProductMediaSwipePager.css";

/** Сдвиг пальца (px), после которого понятно направление жеста. */
const DIRECTION_LOCK_PX = 8;
/** Листаем на соседнее фото, если сдвинули дальше этой доли ширины… */
const SWIPE_DISTANCE_RATIO = 0.18;
/** …или смахнули быстрее этого (px/мс). */
const SWIPE_VELOCITY_PX_PER_MS = 0.35;
/** Скорость не в счёт, если палец перед отпусканием стоял дольше (мс). */
const SWIPE_VELOCITY_STALE_MS = 100;
/** Сопротивление, когда тянут за крайнее фото. */
const EDGE_RESISTANCE = 0.35;

/**
 * @param {number} index
 * @param {number} offsetPx
 */
function buildTrackTransform(index, offsetPx) {
  const base = -index * 100;
  return offsetPx === 0
    ? `translate3d(${base}%, 0, 0)`
    : `translate3d(calc(${base}% + ${offsetPx}px), 0, 0)`;
}

/**
 * Галерея фото на тач-устройствах: свайп двигает полосу слайдов через
 * transform, без нативной горизонтальной прокрутки. Вертикальный жест
 * остаётся браузеру (`touch-action: pan-y`), лента прокручивается как обычно.
 * В DOM только текущее фото и соседи.
 *
 * @param {{
 *   slideCount: number;
 *   activeIndex: number;
 *   onIndexChange: (index: number) => void;
 *   renderSlide: (index: number) => import('react').ReactNode;
 *   className?: string;
 * }} props
 */
export function ProductMediaSwipePager({
  slideCount,
  activeIndex,
  onIndexChange,
  renderSlide,
  className = "",
}) {
  const rootRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const trackRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const gestureRef = useRef(
    /** @type {null | {
     *   pointerId: number;
     *   startX: number;
     *   startY: number;
     *   lastX: number;
     *   lastTime: number;
     *   velocity: number;
     *   width: number;
     *   axis: "x" | "y" | null;
     * }} */ (null),
  );
  const suppressClickRef = useRef(false);
  const shownIndexRef = useRef(activeIndex);
  const lastIndex = Math.max(slideCount - 1, 0);

  const moveTrack = useCallback((index, offsetPx, animate) => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    // Пустая строка возвращает transition из CSS.
    track.style.transition = animate ? "" : "none";
    track.style.transform = buildTrackTransform(index, offsetPx);
  }, []);

  useLayoutEffect(() => {
    const animate = shownIndexRef.current !== activeIndex;
    shownIndexRef.current = activeIndex;
    moveTrack(activeIndex, 0, animate);
  }, [activeIndex, moveTrack]);

  const handlePointerDown = (event) => {
    suppressClickRef.current = false;
    if (slideCount <= 1 || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      width: rootRef.current?.clientWidth ?? 0,
      axis: null,
    };
  };

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;

    if (gesture.axis == null) {
      if (Math.abs(dx) < DIRECTION_LOCK_PX && Math.abs(dy) < DIRECTION_LOCK_PX) {
        return;
      }
      gesture.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (gesture.axis === "x") {
        suppressClickRef.current = true;
        rootRef.current?.setPointerCapture?.(event.pointerId);
      }
    }
    if (gesture.axis !== "x") {
      return;
    }

    const elapsed = event.timeStamp - gesture.lastTime;
    if (elapsed > 0) {
      gesture.velocity = (event.clientX - gesture.lastX) / elapsed;
    }
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;

    const pullingPastEdge =
      (activeIndex === 0 && dx > 0) || (activeIndex === lastIndex && dx < 0);
    moveTrack(activeIndex, pullingPastEdge ? dx * EDGE_RESISTANCE : dx, false);
  };

  const finishGesture = (event, cancelled) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }
    gestureRef.current = null;
    if (gesture.axis !== "x") {
      return;
    }

    let nextIndex = activeIndex;
    if (!cancelled) {
      const distance = event.clientX - gesture.startX;
      const velocity =
        event.timeStamp - gesture.lastTime > SWIPE_VELOCITY_STALE_MS
          ? 0
          : gesture.velocity;
      const passedDistance = Math.abs(distance) > gesture.width * SWIPE_DISTANCE_RATIO;
      const flung =
        Math.abs(velocity) > SWIPE_VELOCITY_PX_PER_MS &&
        Math.sign(velocity) === Math.sign(distance);
      if (distance !== 0 && (passedDistance || flung)) {
        nextIndex = Math.min(
          Math.max(activeIndex + (distance < 0 ? 1 : -1), 0),
          lastIndex,
        );
      }
    }

    if (nextIndex === activeIndex) {
      moveTrack(activeIndex, 0, true);
      return;
    }
    onIndexChange(nextIndex);
  };

  // После свайпа мышью браузер присылает click — он не должен открыть товар.
  // На iOS click после свайпа не приходит, поэтому флаг сбрасывается и на
  // следующем касании.
  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) {
      return;
    }
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      ref={rootRef}
      className={["product-media-swipe-pager", className].filter(Boolean).join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => finishGesture(event, false)}
      onPointerCancel={(event) => finishGesture(event, true)}
      onClickCapture={handleClickCapture}
    >
      <div ref={trackRef} className="product-media-swipe-pager__track">
        {Array.from({ length: slideCount }, (_, index) => (
          <div
            key={index}
            className="product-media-swipe-pager__slide"
            aria-hidden={index === activeIndex ? undefined : true}
          >
            {Math.abs(index - activeIndex) <= 1 ? renderSlide(index) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
