import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SITE_HEADER_BANNER_UI } from "../../../shared/config/appUiCopy.js";
import {
  isExternalHttpUrl,
  openSiteHeaderBannerLink,
  resolveSiteHeaderBannerHref,
} from "../../../shared/lib/openSiteHeaderBannerLink.js";
import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";

import "./SiteHeaderBannerCarousel.css";

/** За этим порогом жест считается свайпом, а не кликом по слайду. */
const CLICK_MOVE_TOLERANCE_PX = 16;
/**
 * Для бесшовного loop Embla нужны копии соседей. Тайлим оригинал до этого
 * минимума, а точки/активность маппим по модулю исходного количества слайдов.
 */
const MIN_LOOP_SLIDES = 5;

/**
 * @param {{
 *   slides: import('../model/types.js').SiteHeaderBannerSlide[];
 * }} props
 */
export function SiteHeaderBannerCarousel({ slides }) {
  const navigate = useNavigate();
  const slideCount = slides.length;
  const hasCarousel = slideCount > 1;

  const loopSlides = useMemo(() => {
    if (slideCount <= 1) {
      return slides.map((slide, index) => ({
        slide,
        logicalIndex: index,
        key: slide.id,
      }));
    }
    const reps = Math.max(1, Math.ceil(MIN_LOOP_SLIDES / slideCount));
    const tiled = [];
    for (let rep = 0; rep < reps; rep += 1) {
      slides.forEach((slide, index) => {
        tiled.push({ slide, logicalIndex: index, key: `${slide.id}-${rep}` });
      });
    }
    return tiled;
  }, [slides, slideCount]);

  const autoplayRef = useRef(
    Autoplay(
      {
        delay: SITE_HEADER_BANNER_UI.AUTOPLAY_MS,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      },
      (emblaRoot) => emblaRoot.parentElement,
    ),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      duration: 50,
      skipSnaps: false,
    },
    hasCarousel ? [autoplayRef.current] : [],
  );

  const pointerDownRef = useRef({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }
    const onSelect = () => {
      const snap = emblaApi.selectedScrollSnap();
      setSelectedIndex(((snap % slideCount) + slideCount) % slideCount);
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, slideCount]);

  const scrollTo = useCallback(
    (index) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  /**
   * @param {MouseEvent | import('react').MouseEvent} event
   * @param {string | null | undefined} linkPath
   */
  const handleSlideActivate = (event, linkPath) => {
    const href = resolveSiteHeaderBannerHref(linkPath);
    if (!href) {
      return;
    }

    if (
      hasCarousel &&
      emblaApi &&
      typeof emblaApi.clickAllowed === "function" &&
      !emblaApi.clickAllowed()
    ) {
      event.preventDefault();
      return;
    }

    const movedX = Math.abs(event.clientX - pointerDownRef.current.x);
    const movedY = Math.abs(event.clientY - pointerDownRef.current.y);
    if (movedX > CLICK_MOVE_TOLERANCE_PX || movedY > CLICK_MOVE_TOLERANCE_PX) {
      event.preventDefault();
      return;
    }

    if (isExternalHttpUrl(href)) {
      // target=_blank на <a> — native; preventDefault не нужен
      return;
    }

    event.preventDefault();
    const resolved = openSiteHeaderBannerLink(href);
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
    const href = resolveSiteHeaderBannerHref(slide.linkPath);
    const isInteractive = Boolean(href);
    const isExternal = Boolean(href && isExternalHttpUrl(href));
    const slideStyle = slide.backgroundColor
      ? { backgroundColor: slide.backgroundColor }
      : undefined;

    const content = (
      <div className="site-header-banner-carousel__media">
        <img
          className="site-header-banner-carousel__image-bg"
          src={imageSrc}
          alt=""
          aria-hidden="true"
          loading={isActive ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
        <img
          className="site-header-banner-carousel__image"
          src={imageSrc}
          alt={slide.imageAlt}
          loading={isActive ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
        />
      </div>
    );

    return (
      <div
        key={key}
        className={[
          "site-header-banner-carousel__slide",
          fullWidth && "site-header-banner-carousel__slide_full",
        ]
          .filter(Boolean)
          .join(" ")}
        style={slideStyle}
        aria-hidden={!isActive}
      >
        {isInteractive ? (
          <a
            className="site-header-banner-carousel__link"
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onPointerDownCapture={(event) => {
              pointerDownRef.current = { x: event.clientX, y: event.clientY };
            }}
            onClick={(event) => handleSlideActivate(event, slide.linkPath)}
          >
            {content}
          </a>
        ) : (
          <div className="site-header-banner-carousel__static">{content}</div>
        )}
        <span className="site-header-banner-carousel__ad-badge" aria-hidden="true">
          {SITE_HEADER_BANNER_UI.AD_BADGE}
        </span>
      </div>
    );
  };

  if (!hasCarousel) {
    return (
      <section
        className="site-header-banner-carousel site-header-banner-carousel_single"
        aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      >
        {renderSlide(slides[0], slides[0].id, true, { fullWidth: true })}
      </section>
    );
  }

  return (
    <section
      className="site-header-banner-carousel"
      aria-roledescription="carousel"
      aria-label={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
    >
      <div className="site-header-banner-carousel__viewport" ref={emblaRef}>
        <div className="site-header-banner-carousel__track">
          {loopSlides.map((item) =>
            renderSlide(item.slide, item.key, item.logicalIndex === selectedIndex),
          )}
        </div>
      </div>
      <div className="site-header-banner-carousel__dots" aria-hidden="true">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            className={[
              "site-header-banner-carousel__dot",
              index === selectedIndex && "site-header-banner-carousel__dot_active",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => scrollTo(index)}
            tabIndex={-1}
          />
        ))}
      </div>
    </section>
  );
}
