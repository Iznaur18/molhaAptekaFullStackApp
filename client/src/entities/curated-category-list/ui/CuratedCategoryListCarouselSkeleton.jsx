import {
  CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX,
  CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX,
  CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX,
} from "../lib/curatedCategoryListHomeLayout.js";

import "./CuratedCategoryListCarousel.css";
import "./CuratedCategoryCompactCard.css";
import "../../curated-product-list/ui/CuratedProductListCarouselSkeleton.css";
import "./CuratedCategoryListCarouselSkeleton.css";

/**
 * Плейсхолдер витрины категорий на время загрузки. Те же классы и
 * layout-константы, что у реальной витрины (ряд плиток 2:1, первая —
 * с названием), чтобы после ответа API ничего не прыгало (CLS).
 */
export function CuratedCategoryListCarouselSkeleton() {
  return (
    <section
      className="curated-category-list-carousel curated-category-list-carousel-skeleton"
      aria-hidden="true"
      style={{
        "--curated-visible-cards": String(CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX),
        "--curated-card-gap": `${CURATED_CATEGORY_LIST_HOME_CARD_GAP_PX}px`,
        "--curated-card-min-width": `${CURATED_CATEGORY_LIST_HOME_CARD_MIN_WIDTH_PX}px`,
        "--curated-card-max-width": `${CURATED_CATEGORY_LIST_HOME_CARD_MAX_WIDTH_PX}px`,
      }}
    >
      <div className="curated-category-list-carousel__scroll">
        <ul className="curated-category-list-carousel__track" role="list">
          {Array.from(
            { length: CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX },
            (_, index) => (
              <li key={index} className="curated-category-list-carousel__item">
                <div className="curated-category-compact-card">
                  <span className="curated-category-compact-card__image-wrap curated-product-list-carousel-skeleton__shimmer" />
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
