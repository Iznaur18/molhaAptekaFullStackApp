import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  RAFFLE_FEATURED_BANNER_UI,
  RAFFLE_FEATURED_CAROUSEL_UI,
} from "../../../shared/config/appUiCopy.js";
import { useDialogFocusTrap } from "../../../shared/lib/useDialogFocusTrap.js";
import { useScrollLock } from "../../../shared/lib/useScrollLock.js";
import { useHomeFeaturedRaffleModalAnimation } from "../model/useHomeFeaturedRaffleModalAnimation.js";
import { FeaturedRaffleModalCard } from "./FeaturedRaffleModalCard.jsx";

import "./HomeFeaturedRaffleModal.css";

const MODAL_HORIZONTAL_PADDING_PX = 16;
const MODAL_MAX_WIDTH_PX = 480;
const MODAL_HEIGHT_RATIO = 0.8;
const VISUAL_SIZE_RATIO = 0.94;
const SLIDE_GAP_PX = 12;
const DRAG_THRESHOLD_PX = 48;
const DIRECTION_LOCK_SLOP_PX = 8;

/**
 * @param {{
 *   visible: boolean;
 *   raffles: import('../model/types.js').RaffleFromApi[];
 *   onClose: () => void;
 *   onOpenProducts: (raffleId: string) => void;
 *   getManage?: (raffle: import('../model/types.js').RaffleFromApi) => object | null;
 * }} props
 */
export function HomeFeaturedRaffleModal({
  visible,
  raffles,
  onClose,
  onOpenProducts,
  getManage,
}) {
  const dialogRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const closeButtonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  /** @type {import('react').MutableRefObject<{ pointerId: number; startX: number; startY: number; startIndex: number; captureTarget: HTMLElement; mode: 'pending' | 'active' } | null>} */
  const dragRef = useRef(null);
  const { mounted, isVisible } = useHomeFeaturedRaffleModalAnimation(visible);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);

  const slideCount = raffles.length;
  const cardWidth = Math.min(
    Math.max(0, viewportWidth - MODAL_HORIZONTAL_PADDING_PX * 2),
    MODAL_MAX_WIDTH_PX,
  );
  const dialogHeight = Math.round(viewportHeight * MODAL_HEIGHT_RATIO);
  const visualSize = Math.round(cardWidth * VISUAL_SIZE_RATIO);
  const stride = cardWidth + SLIDE_GAP_PX;
  const activeRaffle = raffles[activeIndex] ?? raffles[0] ?? null;
  const isInteractive = visible && isVisible;

  useScrollLock(mounted);
  useDialogFocusTrap(dialogRef, {
    active: isInteractive,
    initialFocusRef: closeButtonRef,
  });

  useLayoutEffect(() => {
    if (!mounted) {
      return undefined;
    }

    const syncViewport = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, [mounted]);

  useEffect(() => {
    if (!visible) {
      setActiveIndex(0);
      setIsPaused(false);
      setIsDragging(false);
      setDragOffsetPx(0);
    }
  }, [visible]);

  useEffect(() => {
    if (!isInteractive || slideCount <= 1 || isPaused || isDragging || stride <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, RAFFLE_FEATURED_CAROUSEL_UI.AUTOPLAY_MS);

    return () => window.clearInterval(timerId);
  }, [isDragging, isInteractive, isPaused, slideCount, stride]);

  useEffect(() => {
    if (!isInteractive) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isInteractive, onClose]);

  const settleIndex = useCallback(
    (nextIndex) => {
      const clamped = Math.min(Math.max(nextIndex, 0), Math.max(slideCount - 1, 0));
      setActiveIndex(clamped);
      setDragOffsetPx(0);
      setIsDragging(false);
      setIsPaused(false);
    },
    [slideCount],
  );

  const finishDrag = useCallback(
    (clientX) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      const deltaX = clientX - drag.startX;
      let nextIndex = drag.startIndex;
      if (deltaX <= -DRAG_THRESHOLD_PX) {
        nextIndex = drag.startIndex + 1;
      } else if (deltaX >= DRAG_THRESHOLD_PX) {
        nextIndex = drag.startIndex - 1;
      }

      dragRef.current = null;
      settleIndex(nextIndex);
    },
    [settleIndex],
  );

  const handlePointerDown = (event) => {
    if (slideCount <= 1 || event.button !== 0 || stride <= 0) {
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startIndex: activeIndex,
      captureTarget: event.currentTarget,
      mode: "pending",
    };
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;

    if (drag.mode === "pending") {
      const deltaY = event.clientY - drag.startY;
      if (
        Math.abs(deltaX) < DIRECTION_LOCK_SLOP_PX &&
        Math.abs(deltaY) < DIRECTION_LOCK_SLOP_PX
      ) {
        return;
      }
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        dragRef.current = null;
        return;
      }
      drag.mode = "active";
      drag.captureTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
      setIsPaused(true);
    }

    setDragOffsetPx(deltaX);
  };

  const handlePointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    if (drag.mode !== "active") {
      dragRef.current = null;
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
    if (
      drag.mode === "active" &&
      drag.captureTarget.hasPointerCapture(event.pointerId)
    ) {
      drag.captureTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragOffsetPx(0);
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleOpenProducts = () => {
    if (!activeRaffle?._id) {
      return;
    }
    onClose();
    onOpenProducts(String(activeRaffle._id));
  };

  if (!mounted || slideCount === 0 || typeof document === "undefined") {
    return null;
  }

  const trackOffsetPx = stride > 0 ? -(activeIndex * stride) + dragOffsetPx : dragOffsetPx;
  const trackStyle = {
    transform: `translateX(${trackOffsetPx}px)`,
    transition: isDragging ? "none" : "transform 0.45s ease",
  };
  const backdropClassName = [
    "home-featured-raffle-modal__backdrop",
    isVisible ? "home-featured-raffle-modal__backdrop--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body =
    slideCount === 1 ? (
      <FeaturedRaffleModalCard
        raffle={raffles[0]}
        visualSize={visualSize}
        manage={getManage?.(raffles[0]) ?? null}
        isVideoActive={isInteractive}
      />
    ) : (
      <div
        className="home-featured-raffle-modal__carousel"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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
        <div className="home-featured-raffle-modal__track" style={trackStyle}>
          {raffles.map((raffle, index) => (
            <div
              key={raffle._id}
              className="home-featured-raffle-modal__slide"
              style={{ width: `${cardWidth}px` }}
              aria-hidden={index !== activeIndex}
            >
              <FeaturedRaffleModalCard
                raffle={raffle}
                visualSize={visualSize}
                manage={getManage?.(raffle) ?? null}
                isVideoActive={isInteractive && index === activeIndex}
              />
            </div>
          ))}
        </div>
      </div>
    );

  return createPortal(
    <div className={backdropClassName} role="presentation">
      <button
        type="button"
        className="home-featured-raffle-modal__scrim"
        aria-label={RAFFLE_FEATURED_BANNER_UI.CLOSE}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="home-featured-raffle-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={RAFFLE_FEATURED_CAROUSEL_UI.SECTION_ARIA}
        style={{
          width: cardWidth > 0 ? `${cardWidth}px` : undefined,
          height: dialogHeight > 0 ? `${dialogHeight}px` : "80vh",
        }}
      >
        <div className="home-featured-raffle-modal__header">
          <button
            ref={closeButtonRef}
            type="button"
            className="home-featured-raffle-modal__close"
            onClick={onClose}
          >
            {RAFFLE_FEATURED_BANNER_UI.CLOSE}
          </button>
        </div>

        <div className="home-featured-raffle-modal__scroll">{body}</div>

        <div className="home-featured-raffle-modal__footer">
          <button
            type="button"
            className="home-featured-raffle-modal__footer-btn"
            onClick={handleOpenProducts}
          >
            {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
