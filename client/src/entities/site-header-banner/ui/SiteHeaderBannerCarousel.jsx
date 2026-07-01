import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SITE_HEADER_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./SiteHeaderBannerCarousel.css";

const DRAG_THRESHOLD_PX = 48;
const DRAG_THRESHOLD_RATIO = 0.12;

/**
 * @param {{
 *   slides: import('../model/types.js').SiteHeaderBannerSlide[];
 * }} props
 */
export function SiteHeaderBannerCarousel({ slides }) {
  const navigate = useNavigate();
  const viewportRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  /** @type {import('react').MutableRefObject<{ pointerId: number; startX: number; startIndex: number; captureTarget: HTMLElement } | null>} */
  const dragRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const slideCount = slides.length;
  const safeIndex =
    slideCount > 0 ? ((activeIndex % slideCount) + slideCount) % slideCount : 0;

  useEffect(() => {
    if (activeIndex !== safeIndex) {
      setActiveIndex(safeIndex);
    }
  }, [activeIndex, safeIndex]);

  const goTo = useCallback(
    (nextIndex) => {
      if (slideCount === 0) {
        return;
      }
      const normalized = ((nextIndex % slideCount) + slideCount) % slideCount;
      setActiveIndex(normalized);
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1 || isPaused) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      goTo(safeIndex + 1);
    }, SITE_HEADER_BANNER_UI.AUTOPLAY_MS);

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

  const handleSlideActivate = (linkPath) => {
    if (!linkPath || isDragging) {
      return;
    }
    navigate(linkPath);
  };

  if (slideCount === 0) {
    return null;
  }

  const renderSlide = (slide, index) => {
    const imageSrc = resolveImageUrlForDisplay(slide.imageUrl);
    const isInteractive = Boolean(slide.linkPath);
    const slideStyle = slide.backgroundColor
      ? { backgroundColor: slide.backgroundColor }
      : undefined;

    const content = (
      <img
        className="site-header-banner-carousel__image"
        src={imageSrc}
        alt={slide.imageAlt}
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    );

    return (
      <div
        key={slide.id}
        className="site-header-banner-carousel__slide"
        style={slideStyle}
        aria-hidden={index !== safeIndex}
      >
        {isInteractive ? (
          <button
            type="button"
            className="site-header-banner-carousel__link"
            onClick={() => handleSlideActivate(slide.linkPath)}
          >
            {content}
          </button>
        ) : (
          <div className="site-header-banner-carousel__static">{content}</div>
        )}
      </div>
    );
  };

  if (slideCount === 1) {
    return (
      <section
        className="site-header-banner-carousel site-header-banner-carousel_single"
        aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      >
        {renderSlide(slides[0], 0)}
      </section>
    );
  }

  const trackStyle = {
    transform: `translateX(calc(-${safeIndex} * 100% + ${dragOffsetPx}px))`,
    transition: isDragging ? "none" : "transform 0.45s ease",
  };

  return (
    <section
      className="site-header-banner-carousel"
      aria-roledescription="carousel"
      aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
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
      <div
        ref={viewportRef}
        className="site-header-banner-carousel__viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div className="site-header-banner-carousel__track" style={trackStyle}>
          {slides.map((slide, index) => renderSlide(slide, index))}
        </div>
      </div>
      <div className="site-header-banner-carousel__dots" aria-hidden="true">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={[
              "site-header-banner-carousel__dot",
              index === safeIndex && "site-header-banner-carousel__dot_active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => goTo(index)}
            tabIndex={-1}
          />
        ))}
      </div>
    </section>
  );
}
