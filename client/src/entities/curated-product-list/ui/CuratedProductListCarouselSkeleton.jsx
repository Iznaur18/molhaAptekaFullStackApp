import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX,
  CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX,
} from "../lib/curatedProductListHomeLayout.js";

import "./CuratedProductListCarousel.css";
import "./CuratedProductCompactCard.css";
import "./CuratedProductListCarouselSkeleton.css";

/**
 * Плейсхолдер карусели подборок на время загрузки. Использует те же
 * классы и layout-константы, что и реальная карусель, чтобы каталог
 * под ней не сдвигался после ответа API (CLS).
 */
export function CuratedProductListCarouselSkeleton() {
  return (
    <section
      className="curated-product-list-carousel curated-product-list-carousel-skeleton"
      aria-hidden="true"
      style={{
        "--curated-visible-cards": String(CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX),
        "--curated-card-gap": `${CURATED_PRODUCT_LIST_HOME_CARD_GAP_PX}px`,
        "--curated-card-min-width": `${CURATED_PRODUCT_LIST_HOME_CARD_MIN_WIDTH_PX}px`,
        "--curated-card-max-width": `${CURATED_PRODUCT_LIST_HOME_CARD_MAX_WIDTH_PX}px`,
      }}
    >
      <h2 className="curated-product-list-carousel__title">
        <span className="curated-product-list-carousel-skeleton__title-line" />
      </h2>
      <div className="curated-product-list-carousel__scroll">
        {Array.from(
          { length: CURATED_PRODUCT_LIST_HOME_VISIBLE_CARD_MAX },
          (_, index) => (
            <div key={index} className="curated-product-compact-card">
              <span className="curated-product-compact-card__image-wrap curated-product-list-carousel-skeleton__shimmer" />
              <span className="curated-product-compact-card__price-wrap curated-product-list-carousel-skeleton__price" />
            </div>
          ),
        )}
      </div>
    </section>
  );
}
