import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PRODUCT_DETAILS_MODAL_UI } from "../../../shared/config/appUiCopy.js";
import { ICON_SIZE_PX } from "../../../shared/ui/icon/iconSizes.js";
import { buildProductMediaSlides } from "../lib/buildProductMediaSlides.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../model/productConstants.js";
import { ProductMediaHorizontalPager } from "./ProductMediaHorizontalPager.jsx";
import { ProductMediaSlideContent } from "./ProductMediaSlideContent.jsx";

import "./ProductMediaGalleryReadonly.css";

/**
 * @param {{
 *   imageUrls: string[];
 *   previewVideoUrl?: string | null;
 *   isActive?: boolean;
 *   resetToken?: string | number | null;
 *   onBack?: () => void;
 *   className?: string;
 *   heroOverlay?: import('react').ReactNode;
 * }} props
 */
export function ProductMediaGalleryReadonly({
  imageUrls,
  previewVideoUrl = null,
  isActive = true,
  resetToken = null,
  onBack,
  className = "",
  heroOverlay = null,
}) {
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    const slides = buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls,
    });
    return slides.length > 0
      ? slides
      : [{ type: "image", url: PRODUCT_IMAGE_PLACEHOLDER_URL }];
  }, [imageUrls, previewVideoUrl, previewVideoFailed]);

  const slideCount = mediaSlides.length;
  const hasMultipleSlides = slideCount > 1;
  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, slideCount - 1));

  useEffect(() => {
    setActiveSlideIndex(0);
    setPreviewVideoFailed(false);
  }, [resetToken]);

  useEffect(() => {
    setActiveSlideIndex((index) => Math.min(index, Math.max(0, slideCount - 1)));
  }, [slideCount]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [previewVideoUrl]);

  useEffect(() => {
    if (!isActive || !hasMultipleSlides) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveSlideIndex((index) => Math.max(0, index - 1));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveSlideIndex((index) => Math.min(slideCount - 1, index + 1));
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hasMultipleSlides, isActive, slideCount]);

  const renderSlide = useCallback(
    (index) => {
      const slide = mediaSlides[index] ?? null;
      return (
        <ProductMediaSlideContent
          slide={slide}
          playVideoWhenVisible={false}
          loading="eager"
          blurBackdrop
          imageClassName="product-media-gallery-readonly__image product-media-gallery-readonly__image--fill-hero"
          onVideoFailed={() => setPreviewVideoFailed(true)}
        />
      );
    },
    [mediaSlides],
  );

  const rootClass = ["product-media-gallery-readonly", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <div
        className={
          hasMultipleSlides
            ? "product-media-gallery-readonly__hero product-media-gallery-readonly__hero--multi"
            : "product-media-gallery-readonly__hero"
        }
        {...(hasMultipleSlides
          ? {
              role: "region",
              "aria-label": PRODUCT_DETAILS_MODAL_UI.SLIDER_REGION_ARIA,
            }
          : {})}
      >
        <ProductMediaHorizontalPager
          className="product-media-gallery-readonly__pager"
          slideCount={slideCount}
          activeIndex={safeSlideIndex}
          onIndexChange={setActiveSlideIndex}
          renderSlide={renderSlide}
        />
        <div className="product-media-gallery-readonly__chrome">
          {typeof onBack === "function" ? (
            <button
              type="button"
              className="product-media-gallery-readonly__back-btn"
              aria-label={PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onBack();
              }}
            >
              <ChevronLeft size={ICON_SIZE_PX.lg} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : null}
          {heroOverlay}
          {hasMultipleSlides ? (
            <span
              className="product-media-gallery-readonly__slider-counter"
              aria-live="polite"
            >
              {safeSlideIndex + 1} / {slideCount}
            </span>
          ) : null}
        </div>
      </div>
      {hasMultipleSlides ? (
        <div
          className="product-media-gallery-readonly__thumbs"
          role="tablist"
          aria-label={PRODUCT_DETAILS_MODAL_UI.GALLERY_THUMBS_ARIA}
        >
          {mediaSlides.map((slide, index) => (
            <button
              key={`${slide.type}-${index}-${slide.url}`}
              type="button"
              role="tab"
              aria-selected={index === safeSlideIndex}
              className={
                index === safeSlideIndex
                  ? "product-media-gallery-readonly__thumb product-media-gallery-readonly__thumb--active"
                  : "product-media-gallery-readonly__thumb"
              }
              onClick={() => setActiveSlideIndex(index)}
            >
              {slide.type === "video" ? (
                <span
                  className="product-media-gallery-readonly__thumb-video"
                  aria-hidden="true"
                >
                  ▶
                </span>
              ) : (
                <img src={slide.url} alt="" loading="lazy" decoding="async" />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
