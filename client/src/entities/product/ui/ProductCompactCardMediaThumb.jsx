import { useProductCardMediaState } from "./product-card/useProductCardMediaState.js";
import { PRODUCT_IMAGE_PLACEHOLDER_URL } from "../model/productConstants.js";

import "./MyProductCatalogCard.css";

/**
 * @param {{
 *   product: import('../model/types.js').ProductFromApi;
 *   onPress?: () => void;
 *   accessibilityLabel: string;
 *   dimmed?: boolean;
 * }} props
 */
export function ProductCompactCardMediaThumb({
  product,
  onPress,
  accessibilityLabel,
  dimmed = false,
}) {
  const cardMedia = useProductCardMediaState(product);
  const slideCount = cardMedia.mediaSlides.length;
  const slide = cardMedia.renderedSlide;
  const imageUrl =
    slide?.type === "image"
      ? slide.url
      : slide?.type === "video"
        ? PRODUCT_IMAGE_PLACEHOLDER_URL
        : PRODUCT_IMAGE_PLACEHOLDER_URL;

  const showPreviousSlide = (event) => {
    event.stopPropagation();
    cardMedia.setCardSlideIndex(
      (index) => (index - 1 + slideCount) % slideCount,
    );
  };

  const showNextSlide = (event) => {
    event.stopPropagation();
    cardMedia.setCardSlideIndex((index) => (index + 1) % slideCount);
  };

  return (
    <div
      className={[
        "my-product-compact-thumb",
        dimmed ? "my-product-compact-thumb--dimmed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="my-product-compact-thumb__press"
        onClick={onPress}
        aria-label={accessibilityLabel}
      >
        <img
          className="my-product-compact-thumb__media"
          src={imageUrl}
          alt=""
          onError={() => cardMedia.setUseFallbackImage(true)}
        />
      </button>

      {slideCount > 1 ? (
        <>
          <span className="my-product-compact-thumb__counter">
            {cardMedia.cardSlideIndex + 1}/{slideCount}
          </span>
          <div className="my-product-compact-thumb__nav">
            <button
              type="button"
              className="my-product-compact-thumb__nav-btn"
              onClick={showPreviousSlide}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
            <button
              type="button"
              className="my-product-compact-thumb__nav-btn"
              onClick={showNextSlide}
              aria-label="Следующее фото"
            >
              ›
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
