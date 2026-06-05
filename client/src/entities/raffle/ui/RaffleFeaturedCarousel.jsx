import { useCallback, useEffect, useRef, useState } from "react";

import { RAFFLE_FEATURED_CAROUSEL_UI } from "../../../shared/config/appUiCopy.js";
import { RaffleFeaturedBanner } from "./RaffleFeaturedBanner.jsx";

import "./RaffleFeaturedCarousel.css";

const DRAG_THRESHOLD_PX = 48;
const DRAG_THRESHOLD_RATIO = 0.12;

/**
 * @param {{
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   activeIndex: number;
 *   onActiveIndexChange: (index: number) => void;
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => {
 *     showEdit?: boolean;
 *     showDelete?: boolean;
 *     showPause?: boolean;
 *     onEdit?: () => void;
 *     onDelete?: () => void;
 *     onPause?: () => void;
 *     busy?: boolean;
 *   } | null;
 * }} props
 */
export function RaffleFeaturedCarousel({
  raffles,
  activeIndex,
  onActiveIndexChange,
  onOpenProducts,
  getManage,
}) {
  const viewportRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  /** @type {import('react').MutableRefObject<{ pointerId: number; startX: number; startIndex: number; captureTarget: HTMLElement } | null>} */
  const dragRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const slideCount = raffles.length;
  const safeIndex =
    slideCount > 0 ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  useEffect(() => {
    if (activeIndex !== safeIndex) {
      onActiveIndexChange(safeIndex);
    }
  }, [activeIndex, onActiveIndexChange, safeIndex]);

  const goTo = useCallback(
    (nextIndex) => {
      if (slideCount === 0) {
        return;
      }
      const normalized = ((nextIndex % slideCount) + slideCount) % slideCount;
      onActiveIndexChange(normalized);
    },
    [onActiveIndexChange, slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1 || isPaused) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      goTo(safeIndex + 1);
    }, RAFFLE_FEATURED_CAROUSEL_UI.AUTOPLAY_MS);

    return () => window.clearInterval(timerId);
  }, [goTo, isPaused, safeIndex, slideCount]);

  const finishDrag = useCallback(
    (clientX) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      const viewportWidth = viewportRef.current?.offsetWidth ?? 0;
      const threshold = Math.max(
        DRAG_THRESHOLD_PX,
        viewportWidth * DRAG_THRESHOLD_RATIO,
      );
      const deltaX = clientX - drag.startX;

      if (deltaX <= -threshold) {
        goTo(drag.startIndex + 1);
      } else if (deltaX >= threshold) {
        goTo(drag.startIndex - 1);
      }

      dragRef.current = null;
      setDragOffsetPx(0);
      setIsDragging(false);
      setIsPaused(false);
    },
    [goTo],
  );

  const handlePointerDown = (event) => {
    if (slideCount <= 1 || event.button !== 0) {
      return;
    }
    const captureTarget = event.currentTarget;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startIndex: safeIndex,
      captureTarget,
    };
    setIsDragging(true);
    setIsPaused(true);
    setDragOffsetPx(0);
    captureTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    setDragOffsetPx(event.clientX - drag.startX);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (drag.captureTarget.hasPointerCapture(event.pointerId)) {
      drag.captureTarget.releasePointerCapture(event.pointerId);
    }
    finishDrag(event.clientX);
  };

  const handlePointerCancel = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (drag.captureTarget.hasPointerCapture(event.pointerId)) {
      drag.captureTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragOffsetPx(0);
    setIsDragging(false);
    setIsPaused(false);
  };

  if (slideCount === 0) {
    return null;
  }

  if (slideCount === 1) {
    const raffle = raffles[0];
    return (
      <RaffleFeaturedBanner
        raffle={raffle}
        onOpenProducts={onOpenProducts}
        manage={getManage?.(raffle) ?? null}
      />
    );
  }

  const trackStyle = {
    transform: `translateX(calc(-${safeIndex} * (100% + var(--raffle-carousel-slide-gap, 0.75rem)) + ${dragOffsetPx}px))`,
    transition: isDragging ? "none" : "transform 0.45s ease",
  };

  const visualDragHandlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    isDragging,
  };

  return (
    <section
      className="raffle-featured-carousel"
      aria-roledescription="carousel"
      aria-label="Розыгрыши на витрине"
      onMouseEnter={() => {
        if (!isDragging) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (!isDragging) {
          setIsPaused(false);
        }
      }}
    >
      <div ref={viewportRef} className="raffle-featured-carousel__viewport">
        <div className="raffle-featured-carousel__track" style={trackStyle}>
          {raffles.map((raffle, index) => (
            <div
              key={raffle._id}
              className="raffle-featured-carousel__slide"
              aria-hidden={index !== safeIndex}
            >
              <RaffleFeaturedBanner
                raffle={raffle}
                onOpenProducts={onOpenProducts}
                manage={getManage?.(raffle) ?? null}
                carouselVisualDrag={visualDragHandlers}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
