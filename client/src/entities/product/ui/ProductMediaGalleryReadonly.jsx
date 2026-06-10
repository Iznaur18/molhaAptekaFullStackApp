import { ChevronLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PRODUCT_CARD_UI,
  PRODUCT_DETAILS_MODAL_UI,
} from "../../../shared/config/appUiCopy.js";
import { ICON_SIZE_PX } from "../../../shared/ui/icon/iconSizes.js";
import {
  buildProductMediaSlides,
  resolveProductImageIndexForLightbox,
} from "../lib/buildProductMediaSlides.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../model/productConstants.js";
import { ProductImageLightbox } from "./ProductImageLightbox.jsx";
import { ProductMediaSlideContent } from "./ProductMediaSlideContent.jsx";

import "./ProductMediaGalleryReadonly.css";

/**
 * @param {{
 *   imageUrls: string[];
 *   previewVideoUrl?: string | null;
 *   isActive?: boolean;
 *   resetToken?: string | number | null;
 *   onLightboxOpenChange?: (open: boolean) => void;
 *   onBack?: () => void;
 *   className?: string;
 * }} props
 */
export function ProductMediaGalleryReadonly({
  imageUrls,
  previewVideoUrl = null,
  isActive = true,
  resetToken = null,
  onLightboxOpenChange,
  onBack,
  className = "",
}) {
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  const safeSlideIndex = Math.min(
    activeSlideIndex,
    Math.max(0, mediaSlides.length - 1),
  );
  const activeSlide = mediaSlides[safeSlideIndex] ?? null;
  const lightboxStartIndex =
    activeSlide?.type === "image"
      ? resolveProductImageIndexForLightbox(mediaSlides, safeSlideIndex)
      : 0;

  const setLightboxOpenState = useCallback(
    (open) => {
      setLightboxOpen(open);
      onLightboxOpenChange?.(open);
    },
    [onLightboxOpenChange],
  );

  useEffect(() => {
    setActiveSlideIndex(0);
    setLightboxOpenState(false);
    setPreviewVideoFailed(false);
  }, [resetToken, setLightboxOpenState]);

  useEffect(() => {
    setActiveSlideIndex((index) => Math.min(index, Math.max(0, mediaSlides.length - 1)));
  }, [mediaSlides.length]);

  useEffect(() => {
    setPreviewVideoFailed(false);
  }, [previewVideoUrl]);

  useEffect(() => {
    if (!isActive || lightboxOpen) {
      return undefined;
    }

    const slideCount = mediaSlides.length;
    const onKeyDown = (event) => {
      if (slideCount <= 1) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveSlideIndex((index) => (index - 1 + slideCount) % slideCount);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveSlideIndex((index) => (index + 1) % slideCount);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isActive, lightboxOpen, mediaSlides.length]);

  const handleSliderPrev = (event) => {
    event.stopPropagation();
    const slideCount = mediaSlides.length;
    if (slideCount <= 1) {
      return;
    }
    setActiveSlideIndex((index) => (index - 1 + slideCount) % slideCount);
  };

  const handleSliderNext = (event) => {
    event.stopPropagation();
    const slideCount = mediaSlides.length;
    if (slideCount <= 1) {
      return;
    }
    setActiveSlideIndex((index) => (index + 1) % slideCount);
  };

  const rootClass = ["product-media-gallery-readonly", className].filter(Boolean).join(" ");

  return (
    <>
      <div className={rootClass}>
        <div
          className={
            mediaSlides.length > 1
              ? "product-media-gallery-readonly__hero product-media-gallery-readonly__hero--multi"
              : "product-media-gallery-readonly__hero"
          }
          {...(mediaSlides.length > 1
            ? {
                role: "region",
                "aria-label": PRODUCT_DETAILS_MODAL_UI.SLIDER_REGION_ARIA,
              }
            : {})}
        >
          {typeof onBack === "function" ? (
            <button
              type="button"
              className="product-media-gallery-readonly__back-btn"
              aria-label={PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
              onClick={(event) => {
                event.stopPropagation();
                onBack();
              }}
            >
              <ChevronLeft size={ICON_SIZE_PX.lg} strokeWidth={2.25} aria-hidden="true" />
            </button>
          ) : null}
          {mediaSlides.length > 1 ? (
            <>
              <div className="product-media-gallery-readonly__slider-nav">
                <button
                  type="button"
                  className="product-media-gallery-readonly__slider-btn"
                  aria-label={PRODUCT_CARD_UI.GALLERY_PREV}
                  onClick={handleSliderPrev}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="product-media-gallery-readonly__slider-btn"
                  aria-label={PRODUCT_CARD_UI.GALLERY_NEXT}
                  onClick={handleSliderNext}
                >
                  ›
                </button>
              </div>
              <span
                className="product-media-gallery-readonly__slider-counter"
                aria-live="polite"
              >
                {safeSlideIndex + 1} / {mediaSlides.length}
              </span>
            </>
          ) : null}
          {activeSlide?.type === "image" ? (
            <button
              type="button"
              className="product-media-gallery-readonly__image-zoom"
              onClick={(event) => {
                event.stopPropagation();
                setLightboxOpenState(true);
              }}
              aria-label={PRODUCT_DETAILS_MODAL_UI.OPEN_GALLERY_FULLSCREEN}
            >
              <ProductMediaSlideContent
                slide={activeSlide}
                playVideoWhenVisible={false}
                imageClassName="product-media-gallery-readonly__image"
                onVideoFailed={() => setPreviewVideoFailed(true)}
              />
            </button>
          ) : (
            <ProductMediaSlideContent
              slide={activeSlide}
              playVideoWhenVisible={false}
              imageClassName="product-media-gallery-readonly__image product-media-gallery-readonly__image--fill-hero"
              onVideoFailed={() => setPreviewVideoFailed(true)}
            />
          )}
        </div>
        {mediaSlides.length > 1 ? (
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
      {lightboxOpen && imageUrls.length > 0 ? (
        <ProductImageLightbox
          imageUrls={imageUrls}
          startIndex={lightboxStartIndex}
          onClose={() => setLightboxOpenState(false)}
        />
      ) : null}
    </>
  );
}
