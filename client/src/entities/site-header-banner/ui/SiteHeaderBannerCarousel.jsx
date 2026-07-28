import {
  SITE_HEADER_BANNER_CAROUSEL_PEEK_PX,
  SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX,
  SITE_HEADER_BANNER_HEIGHT_PX,
} from "@molha/api-contract";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SITE_HEADER_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import { openSiteHeaderBannerLink } from "../../../shared/lib/openSiteHeaderBannerLink.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";
import {
  resolveSiteHeaderBannerCarouselLoopIndexFromLogical,
  resolveSiteHeaderBannerCarouselLoopIndexFromOffset,
  resolveSiteHeaderBannerCarouselLoopJumpTarget,
  resolveSiteHeaderBannerCarouselLoopLogicalIndex,
  resolveSiteHeaderBannerCarouselMetrics,
  SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES,
} from "../lib/siteHeaderBannerCarouselLayout.js";

import "./SiteHeaderBannerCarousel.css";

const DRAG_THRESHOLD_PX = 48;
const DRAG_THRESHOLD_RATIO = 0.12;
const DIRECTION_LOCK_SLOP_PX = 8;

/**
 * @param {import('../model/types.js').SiteHeaderBannerSlide[]} slides
 */
function buildLoopSlideItems(slides) {
  if (slides.length <= 1) {
    return slides.map((slide, logicalIndex) => ({
      key: `solo-${slide.id}`,
      slide,
      logicalIndex,
    }));
  }

  const first = slides[0];
  const last = slides[slides.length - 1];
  return [
    { key: `clone-last-${last.id}`, slide: last, logicalIndex: slides.length - 1 },
    ...slides.map((slide, logicalIndex) => ({
      key: `slide-${slide.id}`,
      slide,
      logicalIndex,
    })),
    { key: `clone-first-${first.id}`, slide: first, logicalIndex: 0 },
  ];
}

/**
 * @param {{
 *   slides: import('../model/types.js').SiteHeaderBannerSlide[];
 * }} props
 */
export function SiteHeaderBannerCarousel({ slides }) {
  const navigate = useNavigate();
  const rootRef = useRef(/** @type {HTMLElement | null} */ (null));
  const viewportRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  /** @type {import('react').MutableRefObject<{ pointerId: number; startX: number; startY: number; startLoopIndex: number; captureTarget: HTMLElement; mode: 'pending' | 'active' } | null>} */
  const dragRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loopIndex, setLoopIndex] = useState(() =>
    slides.length > 1 ? SITE_HEADER_BANNER_CAROUSEL_LOOP_EDGE_CLONES : 0,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const slideCount = slides.length;
  const loopItems = useMemo(() => buildLoopSlideItems(slides), [slides]);
  const metrics = useMemo(
    () => resolveSiteHeaderBannerCarouselMetrics(viewportWidth),
    [viewportWidth],
  );
  const { slideWidth, stride, sideInset, gapWidth } = metrics;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const syncWidth = () => {
      setViewportWidth(root.clientWidth);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slideCount <= 1) {
      setLoopIndex(0);
      setActiveIndex(0);
      return;
    }
    setLoopIndex(resolveSiteHeaderBannerCarouselLoopIndexFromLogical(0));
    setActiveIndex(0);
  }, [slideCount]);

  const goToLogical = useCallback(
    (nextLogicalIndex, animated = true) => {
      if (slideCount === 0) {
        return;
      }
      const normalized =
        ((nextLogicalIndex % slideCount) + slideCount) % slideCount;
      setActiveIndex(normalized);
      if (slideCount === 1) {
        setLoopIndex(0);
        return;
      }
      setLoopIndex(resolveSiteHeaderBannerCarouselLoopIndexFromLogical(normalized));
      if (!animated) {
        setDragOffsetPx(0);
      }
    },
    [slideCount],
  );

  useEffect(() => {
    if (slideCount <= 1 || isPaused || isDragging) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      goToLogical(activeIndex + 1);
    }, SITE_HEADER_BANNER_UI.AUTOPLAY_MS);

    return () => window.clearInterval(timerId);
  }, [activeIndex, goToLogical, isDragging, isPaused, slideCount]);

  const settleLoopIndex = useCallback(
    (nextLoopIndex) => {
      if (slideCount <= 1 || stride <= 0) {
        return;
      }

      const jumpTarget = resolveSiteHeaderBannerCarouselLoopJumpTarget(
        nextLoopIndex,
        slideCount,
      );
      if (jumpTarget != null) {
        setLoopIndex(jumpTarget);
        setActiveIndex(
          resolveSiteHeaderBannerCarouselLoopLogicalIndex(jumpTarget, slideCount),
        );
        setDragOffsetPx(0);
        return;
      }

      setLoopIndex(nextLoopIndex);
      setActiveIndex(
        resolveSiteHeaderBannerCarouselLoopLogicalIndex(nextLoopIndex, slideCount),
      );
      setDragOffsetPx(0);
    },
    [slideCount, stride],
  );

  const finishDrag = useCallback(
    (clientX) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }

      const threshold = Math.max(DRAG_THRESHOLD_PX, slideWidth * DRAG_THRESHOLD_RATIO);
      const deltaX = clientX - drag.startX;
      let nextLoopIndex = drag.startLoopIndex;

      if (deltaX <= -threshold) {
        nextLoopIndex = drag.startLoopIndex + 1;
      } else if (deltaX >= threshold) {
        nextLoopIndex = drag.startLoopIndex - 1;
      } else if (stride > 0) {
        const offsetX = drag.startLoopIndex * stride - deltaX;
        nextLoopIndex = resolveSiteHeaderBannerCarouselLoopIndexFromOffset(
          offsetX,
          stride,
        );
      }

      dragRef.current = null;
      setIsDragging(false);
      setIsPaused(false);
      settleLoopIndex(nextLoopIndex);
    },
    [settleLoopIndex, slideWidth, stride],
  );

  const handlePointerDown = (event) => {
    if (slideCount <= 1 || event.button !== 0 || stride <= 0) {
      return;
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLoopIndex: loopIndex,
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

  const handleSlideActivate = (linkPath) => {
    if (!linkPath || isDragging) {
      return;
    }
    const resolved = openSiteHeaderBannerLink(linkPath);
    if (resolved) {
      navigate(resolved);
    }
  };

  if (slideCount === 0) {
    return null;
  }

  /**
   * @param {import('../model/types.js').SiteHeaderBannerSlide} slide
   * @param {string} key
   * @param {boolean} isActive
   */
  const renderSlide = (slide, key, isActive, { fullWidth = false } = {}) => {
    const imageSrc = resolveImageUrlForDisplay(slide.imageUrl);
    const isInteractive = Boolean(slide.linkPath);
    const slideStyle = {
      width: fullWidth || slideWidth <= 0 ? "100%" : `${slideWidth}px`,
      ...(slide.backgroundColor ? { backgroundColor: slide.backgroundColor } : null),
    };

    const content = (
      <img
        className="site-header-banner-carousel__image"
        src={imageSrc}
        alt={slide.imageAlt}
        loading={isActive ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    );

    return (
      <div
        key={key}
        className="site-header-banner-carousel__slide"
        style={slideStyle}
        aria-hidden={!isActive}
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
        <span className="site-header-banner-carousel__ad-badge" aria-hidden="true">
          {SITE_HEADER_BANNER_UI.AD_BADGE}
        </span>
      </div>
    );
  };

  if (slideCount === 1) {
    return (
      <section
        ref={rootRef}
        className="site-header-banner-carousel site-header-banner-carousel_single"
        aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
        style={{
          "--site-header-banner-height": `${SITE_HEADER_BANNER_HEIGHT_PX}px`,
        }}
      >
        {renderSlide(slides[0], slides[0].id, true, { fullWidth: true })}
      </section>
    );
  }

  const trackOffsetPx =
    stride > 0 ? -(loopIndex * stride) + dragOffsetPx + sideInset : dragOffsetPx;
  const trackStyle = {
    gap: `${gapWidth || SITE_HEADER_BANNER_CAROUSEL_SLIDE_GAP_PX}px`,
    paddingRight: `${sideInset || SITE_HEADER_BANNER_CAROUSEL_PEEK_PX}px`,
    transform: `translateX(${trackOffsetPx}px)`,
    transition: isDragging ? "none" : "transform 0.45s ease",
  };

  return (
    <section
      ref={rootRef}
      className="site-header-banner-carousel"
      aria-roledescription="carousel"
      aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      style={{
        "--site-header-banner-height": `${SITE_HEADER_BANNER_HEIGHT_PX}px`,
      }}
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
          {loopItems.map((item) =>
            renderSlide(item.slide, item.key, item.logicalIndex === activeIndex),
          )}
        </div>
        <div className="site-header-banner-carousel__dots" aria-hidden="true">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={[
                "site-header-banner-carousel__dot",
                index === activeIndex && "site-header-banner-carousel__dot_active",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => goToLogical(index)}
              tabIndex={-1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
