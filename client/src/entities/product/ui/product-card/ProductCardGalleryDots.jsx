import { PRODUCT_CARD_UI } from "../../../../shared/config/appUiCopy.js";

/**
 * @param {{
 *   slideIndex: number;
 *   slideCount: number;
 * }} props
 */
export function ProductCardGalleryDots({ slideIndex, slideCount }) {
  if (slideCount <= 1) {
    return null;
  }

  return (
    <div
      className="product-card__gallery-dots"
      aria-live="polite"
      aria-label={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(slideIndex + 1, slideCount)}
    >
      {Array.from({ length: slideCount }, (_, index) => (
        <span
          key={index}
          className={[
            "product-card__gallery-dot",
            index === slideIndex ? "product-card__gallery-dot--active" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
