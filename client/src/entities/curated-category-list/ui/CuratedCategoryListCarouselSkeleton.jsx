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

const SKELETON_CARD_COUNT = Math.max(
  2,
  Math.ceil(CURATED_CATEGORY_LIST_HOME_VISIBLE_CARD_MAX),
);

/**
 * Плейсхолдер витрины категорий на время загрузки. Шапка + ряд плиток
 * 4:3 — те же классы/константы, что у реальной витрины, чтобы после
 * ответа API ничего не прыгало (CLS).
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
      <div className="curated-category-list-carousel__header">
        <span className="curated-category-list-carousel-skeleton__title curated-product-list-carousel-skeleton__shimmer" />
        <span className="curated-category-list-carousel-skeleton__view-all curated-product-list-carousel-skeleton__shimmer" />
      </div>
      <div className="curated-category-list-carousel__scroll">
        <ul className="curated-category-list-carousel__track" role="list">
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <li key={index} className="curated-category-list-carousel__item">
              <div className="curated-category-compact-card">
                <span className="curated-category-compact-card__image-wrap curated-product-list-carousel-skeleton__shimmer" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
